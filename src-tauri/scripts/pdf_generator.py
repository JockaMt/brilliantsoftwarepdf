import argparse
import base64
import io
import re
import json
import os
import sys
from datetime import datetime
from reportlab.lib.colors import Color as rlColor, Color
from reportlab.lib.utils import ImageReader
from reportlab.graphics.shapes import Rect, Drawing, Polygon
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image
import sqlite3

class DatabaseAdapter:
    """Adaptador para trabalhar com a estrutura de banco atual do projeto"""
    
    def __init__(self, data_dict):
        self.data = data_dict
        self.user_settings = data_dict.get('user_settings', {})
        self.sections = data_dict.get('sections', [])
        self.items = data_dict.get('items', [])
        self.infos = data_dict.get('infos', [])
        
        # Debug - mostrar dados recebidos
        print(f"DEBUG: Dados recebidos - {len(self.sections)} seções, {len(self.items)} itens, {len(self.infos)} infos")
        print(f"DEBUG: User settings disponíveis: {list(self.user_settings.keys())}")
        if 'image_base64' in self.user_settings:
            print(f"DEBUG: image_base64 encontrado, comprimento: {len(self.user_settings['image_base64'])}")
        if 'image_blob' in self.user_settings:
            print(f"DEBUG: image_blob encontrado, comprimento: {len(self.user_settings['image_blob'])}")
        for info in self.infos:
            print(f"DEBUG: Info disponível - item_code: '{info.get('item_code')}', name: '{info.get('name')}', details: '{info.get('details')}'")
        for item in self.items:
            print(f"DEBUG: Item disponível - code: '{item.get('code')}', description: '{item.get('description')}')")

    def load_items(self):
        """Adapta a estrutura atual para o formato esperado pelo gerador"""
        sections_with_items = []
        
        for section in self.sections:
            section_items = []
            # Filtrar itens desta seção
            for item in self.items:
                if item.get('section_id') == section.get('id'):
                    # Buscar informações adicionais do item
                    item_infos = [info for info in self.infos if info.get('item_code') == item.get('code')]
                    
                    # Adaptar para o formato esperado
                    adapted_item = {
                        'cod': item.get('code', ''),
                        'item_name': item.get('description', ''),
                        'section': section.get('name', ''),
                        'gold': '0',  # Removido filtro automático
                        'gold_price': '0',  # Removido filtro automático  
                        'silver': '0',  # Removido filtro automático
                        'silver_price': '0',  # Removido filtro automático
                        'loss': '0',  # Removido filtro automático
                        'time': '0',  # Removido filtro automático
                        'additional_infos': self._get_all_infos(item_infos),
                        'image': self._get_item_image(item)
                    }
                    section_items.append(adapted_item)
            
            if section_items:  # Só adicionar seções com itens
                sections_with_items.append({
                    'name': section.get('name', ''),
                    'items': section_items
                })
        
        return sections_with_items

    def _get_info_value(self, infos, info_name, default='0'):
        """Busca um valor específico nas informações do item"""
        for info in infos:
            if info_name.lower() in info.get('name', '').lower():
                return info.get('details', default)
        return default

    def _get_all_infos(self, infos):
        """Retorna todas as informações adicionais formatadas"""
        additional_infos = []
        print(f"DEBUG: Processando {len(infos)} informações")  # Debug
        for info in infos:
            name = info.get('name', '')
            details = info.get('details', '')
            print(f"DEBUG: Info - Nome: '{name}', Detalhes: '{details}'")  # Debug
            if name and details:
                # Incluir TODAS as informações por enquanto
                additional_infos.append(f'{name}: {details}')
                print(f"DEBUG: Adicionada info: '{name}: {details}'")  # Debug
        print(f"DEBUG: Total de infos adicionais: {len(additional_infos)}")  # Debug
        return additional_infos

    def _get_item_image(self, item):
        """Tenta recuperar a imagem do item - adaptável conforme sua estrutura"""
        # Se tiver imagem em base64 no item
        if item.get('image_base64'):
            return f"data:image/png;base64,{item['image_base64']}"
        
        # Se tiver caminho da imagem, tentar carregar
        if item.get('image_path'):
            try:
                image_path = item['image_path']
                if os.path.exists(image_path):
                    with open(image_path, 'rb') as img_file:
                        img_data = base64.b64encode(img_file.read()).decode()
                        return f"data:image/png;base64,{img_data}"
            except:
                pass
        
        return None

    def get_phone(self):
        return self.user_settings.get('phone_number', '')
        
    def get_pallet(self):
        # Mapear paletas para números (sincronizado com frontend)
        pallet_map = {
            'classic': 0,      # Ouro Clássico
            'modern': 1,       # Prata Moderna  
            'luxury': 2,       # Luxo Premium
            'rose_gold': 3,    # Ouro Rosé
            'white_gold': 4,   # Ouro Branco
            'diamond': 5,      # Diamante
            'emerald': 6,      # Esmeralda
            'ruby': 7,         # Rubi
            'sapphire': 8,     # Safira
            'vintage': 9       # Vintage
        }
        pallet_name = self.user_settings.get('pallet', 'classic')
        return pallet_map.get(pallet_name, 0)

    def get_name(self):
        return self.user_settings.get('name', 'Catálogo')
    
    def get_logo(self):
        print("DEBUG: Verificando logo do usuário...")
        # Tentar obter logo do usuário através do image_base64
        if self.user_settings.get('image_base64'):
            print("DEBUG: Logo encontrado via image_base64")
            return self.user_settings['image_base64']
        
        # Fallback para image_blob se ainda existir (compatibilidade)
        if self.user_settings.get('image_blob'):
            print("DEBUG: Logo encontrado via image_blob")
            # Converter array de bytes para base64
            image_data = bytes(self.user_settings['image_blob'])
            img_base64 = base64.b64encode(image_data).decode()
            return f"data:image/png;base64,{img_base64}"
        
        print("DEBUG: Nenhum logo encontrado")
        # Fallback para logo padrão se existir
        return None

class MakePdf:
    def __init__(self, filename="", database=None) -> None:
        self.output_path = filename
        self.width, self.height = A4
        self.database = database
        self.sections = self.database.load_items()
        self.canvas = canvas.Canvas(filename, initialFontSize=13)
        self.page_number = 0
        
        # Paletas de cores sincronizadas com o frontend (cores hexadecimais exatas)
        self.pallet_1 = [self.hex_to_rgb("#FEFDF8"), self.hex_to_rgb("#C9A961")]  # Classic - Ouro Clássico
        self.pallet_2 = [self.hex_to_rgb("#FAFAFA"), self.hex_to_rgb("#C0C0C0")]  # Modern - Prata Moderna  
        self.pallet_3 = [self.hex_to_rgb("#FAF0E6"), self.hex_to_rgb("#722F37")]  # Luxury - Luxo Premium
        self.pallet_4 = [self.hex_to_rgb("#FFF8F0"), self.hex_to_rgb("#CD7F32")]  # Rose Gold - Ouro Rosé
        self.pallet_5 = [self.hex_to_rgb("#FAFAFA"), self.hex_to_rgb("#DCDCDC")]  # White Gold - Ouro Branco
        self.pallet_6 = [self.hex_to_rgb("#F8FAFF"), self.hex_to_rgb("#4169E1")]  # Diamond - Diamante
        self.pallet_7 = [self.hex_to_rgb("#F5FFFA"), self.hex_to_rgb("#50C878")]  # Emerald - Esmeralda
        self.pallet_8 = [self.hex_to_rgb("#FFF0F5"), self.hex_to_rgb("#E0115F")]  # Ruby - Rubi
        self.pallet_9 = [self.hex_to_rgb("#F0F8FF"), self.hex_to_rgb("#0F52BA")]  # Sapphire - Safira
        self.pallet_10 = [self.hex_to_rgb("#FDF5E6"), self.hex_to_rgb("#D2691E")]  # Vintage - Vintage
        
        self.pallets = [self.pallet_1, self.pallet_2, self.pallet_3, self.pallet_4, self.pallet_5, 
                       self.pallet_6, self.pallet_7, self.pallet_8, self.pallet_9, self.pallet_10]
        self.pallet_select = int(database.get_pallet())

    def hex_to_rgb(self, hex_color):
        """Converte cor hexadecimal para rlColor RGB"""
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16) / 255.0
        g = int(hex_color[2:4], 16) / 255.0  
        b = int(hex_color[4:6], 16) / 255.0
        return rlColor(r, g, b)

    def draw_lines(self, title: str):
        # Sombra do fundo do título
        self.canvas.setFillColorRGB(0.8, 0.8, 0.8)
        self.canvas.rect(43, 677, self.width-80, 30, fill=1, stroke=0)
        
        # Fundo do título com gradiente simulado
        self.canvas.setFillColor(self.pallets[self.pallet_select][0])
        self.canvas.rect(40, 680, self.width-80, 30, fill=1, stroke=0)
        
        # Bordas ornamentadas
        self.canvas.setStrokeColor(self.pallets[self.pallet_select][1])
        self.canvas.setLineWidth(4)
        self.canvas.line(40, 710, self.width-40, 710)
        self.canvas.setLineWidth(2)
        self.canvas.line(40, 680, self.width-40, 680)
        
        # Título centralizado
        self.canvas.setFont("Helvetica-Bold", 18)
        # Sombra do título
        self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
        self.canvas.drawCentredString(self.width/2 + 1, 689, title.capitalize())
        # Texto principal
        self.canvas.setFillColor(self.pallets[self.pallet_select][1])
        self.canvas.drawCentredString(self.width/2, 690, title.capitalize())
        
        # Bordas laterais ornamentadas
        self.canvas.setStrokeColor(self.pallets[self.pallet_select][1])
        self.canvas.setLineWidth(3)
        self.canvas.line(40, 80, 40, 710)
        self.canvas.line(self.width-40, 80, self.width-40, 710)
        
        # Linhas decorativas internas
        self.canvas.setLineWidth(1)
        self.canvas.line(45, 85, 45, 705)
        self.canvas.line(self.width-45, 85, self.width-45, 705)
        
        self.canvas.setFillColorRGB(0,0,0)  # Reset cor texto padrão

    def draw_header(self):
        # Sombra do fundo superior
        self.canvas.setFillColorRGB(0.9, 0.9, 0.9)
        rect_shadow = Rect(3, 3, self.width, 100)
        rect_shadow.fillColor = rlColor(0.9, 0.9, 0.9)
        rect_shadow.strokeWidth = 0
        d_shadow = Drawing(0, 0)
        d_shadow.add(rect_shadow)
        d_shadow.drawOn(self.canvas, 0, self.height - 103)

        # Fundo superior principal
        rect = Rect(0, 0, self.width, 100)
        rect.fillColor = self.pallets[self.pallet_select][0]
        rect.strokeWidth = 0
        rect.strokeOpacity = 0
        d = Drawing(0, 0)
        d.add(rect)
        d.drawOn(self.canvas, rect.x, self.height - rect.height)

        # Faixa inferior decorativa do header
        rect2 = Rect(0, 0, self.width, 35)
        rect2.fillColor = self.pallets[self.pallet_select][1]
        rect2.strokeOpacity = 0
        d2 = Drawing(0, 0)
        d2.add(rect2)
        d2.drawOn(self.canvas, 0, self.height - 35)

        # Polígono decorativo lateral esquerdo
        dark_rect = Polygon(
            points=[0, 0, 90, 0, 190, rect.height, 0, 100]
        )
        dark_rect.fillColor = self.pallets[self.pallet_select][1]
        dark_rect.strokeWidth = 0
        dark_rect.strokeOpacity = 0
        d3 = Drawing(0, 0)
        d3.add(dark_rect)
        d3.drawOn(self.canvas, 0, self.height - rect.height)

        # Polígono decorativo lateral direito (novo)
        dark_rect_right = Polygon(
            points=[self.width-190, 0, self.width-90, 0, self.width, rect.height, self.width-100, 100]
        )
        dark_rect_right.fillColor = self.pallets[self.pallet_select][1]
        dark_rect_right.strokeWidth = 0
        dark_rect_right.strokeOpacity = 0
        d4 = Drawing(0, 0)
        d4.add(dark_rect_right)
        d4.drawOn(self.canvas, 0, self.height - rect.height)

        # Detalhes ornamentais
        self.canvas.setStrokeColor(self.pallets[self.pallet_select][1])
        self.canvas.setLineWidth(2)
        self.canvas.line(0, self.height-35, self.width, self.height-35)

        # Nome da empresa
        self.canvas.setFont("Helvetica-Bold", 12)
        # Sombra
        self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
        self.canvas.drawRightString(self.width-39, self.height-46, f"{self.database.get_name()}")
        # Texto principal
        self.canvas.setFillColorRGB(1, 1, 1)  # Cor branca
        self.canvas.drawRightString(self.width-40, self.height-45, f"{self.database.get_name()}")

        # Formatar telefone com estilo
        phone = self.database.get_phone()
        if phone:
            cleaned = re.sub(r'\D', '', phone)
            if len(cleaned) >= 10:
                formatted_phone = re.sub(r'^(\d{2})(\d{4,5})(\d{4})$', r'(\1) \2-\3', cleaned)
                self.canvas.setFont("Helvetica", 10)
                # Sombra do telefone
                self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
                self.canvas.drawRightString(self.width-39, self.height-61, f"Contato: {formatted_phone}")
                # Texto principal
                self.canvas.setFillColorRGB(1, 1, 1)  # Cor branca
                self.canvas.drawRightString(self.width-40, self.height-60, f"Contato: {formatted_phone}")
        self.canvas.setFillColorRGB(0,0,0)

    def draw_page_number(self):
        # Fundo decorativo para o rodapé
        self.canvas.setFillColor(self.pallets[self.pallet_select][0])
        self.canvas.rect(0, 0, self.width, 35, fill=1, stroke=0)
        
        # Linha decorativa superior
        self.canvas.setStrokeColor(self.pallets[self.pallet_select][1])
        self.canvas.setLineWidth(2)
        self.canvas.line(0, 35, self.width, 35)
        
        # Número da página
        self.canvas.setFont("Helvetica-Bold", 10)
        # Sombra do número da página
        self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
        self.canvas.drawCentredString(self.width - 39, 16, f"{self.page_number}")
        # Texto principal
        self.canvas.setFillColor(self.pallets[self.pallet_select][1])
        self.canvas.drawCentredString(self.width - 40, 17, f"{self.page_number}")
        
        # Rodapé personalizado com estilo
        self.canvas.setFont("Courier-Oblique", size=8)
        name = "Feito com Brilliant Software © - Contatos: (28) 98113-7532 - Instagram: @brilliantsoftware"
        text_width = self.canvas.stringWidth(name, "Courier-Oblique", 8)
        # Sombra do rodapé
        self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
        self.canvas.drawString(self.width/2 - text_width/2 + 1, 14, name)
        # Texto principal
        self.canvas.setFillColor(self.pallets[self.pallet_select][1])
        self.canvas.drawString(self.width/2 - text_width/2, 15, name)
        
        self.canvas.setFillColorRGB(0,0,0)
        self.canvas.setFont("Courier-Oblique", size=10)

    def render_pdf(self):
        # Página de capa
        self.draw_cover_page()
        
        # Páginas de seções
        for section in self.sections:
            items = section.get("items")
            if not items:
                continue
                
            # Dividir itens em grupos de 3x3 (9 por página)
            lista1 = [items[i:i+3] + [None]*(3 - len(items[i:i+3])) for i in range(0, len(items), 3)]
            lista2 = [lista1[i:i+3] + [None]*(3 - len(lista1[i:i+3])) for i in range(0, len(lista1), 3)]
            
            for item_group in lista2:
                self.draw_header()
                self.draw_lines(section.get("name"))
                self.draw_items(item_group)
                self.page_number += 1
                self.draw_page_number()
                self.draw_logo_small()
                self.canvas.showPage()
        
        self.canvas.save()
        return self.output_path

    def draw_cover_page(self):
        """Desenha a página de capa"""
        self.draw_header()
        
        # Fundo decorativo da capa
        self.canvas.setFillColor(self.pallets[self.pallet_select][0])
        self.canvas.rect(50, 200, self.width-100, self.height-400, fill=1, stroke=0)
        
        # Bordas ornamentadas da capa
        self.canvas.setStrokeColor(self.pallets[self.pallet_select][1])
        self.canvas.setLineWidth(3)
        self.canvas.rect(50, 200, self.width-100, self.height-400, fill=0, stroke=1)
        self.canvas.setLineWidth(1)
        self.canvas.rect(55, 205, self.width-110, self.height-410, fill=0, stroke=1)
        
        # Polígonos decorativos maiores
        dark_rect = Polygon(
            points=[0, self.height, 220, self.height, 0, self.height-220]
        )
        dark_rect.fillColor = self.pallets[self.pallet_select][1]
        dark_rect.strokeWidth = 0
        dark_rect.strokeOpacity = 0
        d = Drawing(0, 0)
        d.add(dark_rect)
        d.drawOn(self.canvas, 0, 0)
        
        dark_rect2 = Polygon(
            points=[self.width, 220, self.width, 0, self.width-220, 0]
        )
        dark_rect2.fillColor = self.pallets[self.pallet_select][1]
        dark_rect2.strokeWidth = 0
        dark_rect2.strokeOpacity = 0
        d2 = Drawing(0, 0)
        d2.add(dark_rect2)
        d2.drawOn(self.canvas, 0, 0)
        
        self.page_number += 1
        self.draw_page_number()
        
        # Logo principal
        self.draw_main_logo()
        
        # Nome da empresa estilizado
        self.canvas.setFont("Helvetica-Bold", 24)
        name = self.database.get_name()
        text_width = self.canvas.stringWidth(name, "Helvetica-Bold", 24)
        
        # Sombra do nome principal
        self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
        self.canvas.drawString(self.width/2 - text_width/2 + 2, self.height/2 - 202, name)
        # Nome principal
        self.canvas.setFillColor(self.pallets[self.pallet_select][1])
        self.canvas.drawString(self.width/2 - text_width/2, self.height/2 - 200, name)
        
        # Informações de contato na capa
        self.draw_contact_info()
        
        self.canvas.showPage()

    def draw_main_logo(self):
        """Desenha o logo principal na capa"""
        print("DEBUG: Iniciando draw_main_logo()")
        logo_data = self.database.get_logo()
        if not logo_data:
            print("DEBUG: Nenhum logo disponível para desenhar")
            return
            
        print(f"DEBUG: Logo encontrado, comprimento: {len(logo_data) if logo_data else 0}")
        try:
            logo_size = 300
            
            # Verificar se o logo já tem o prefixo data:image
            if logo_data.startswith('data:image'):
                image_data_str = logo_data.split(",")[1]
            else:
                # Se não tem prefixo, assumir que já é base64 puro
                image_data_str = logo_data
            
            print(f"DEBUG: Dados base64 extraídos, comprimento: {len(image_data_str)}")
            
            # Corrigir padding do base64
            missing_padding = len(image_data_str) % 4
            if missing_padding:
                image_data_str += '=' * (4 - missing_padding)
                print(f"DEBUG: Padding corrigido, adicionados {4 - missing_padding} caracteres '='")
            
            # Decodificar base64
            image_data = base64.b64decode(image_data_str)
            print(f"DEBUG: Imagem decodificada, {len(image_data)} bytes")
            
            # Criar buffer de imagem
            img_buffer = io.BytesIO(image_data)
            
            # Abrir imagem para obter dimensões
            pil_image = Image.open(img_buffer)
            original_width, original_height = pil_image.size
            print(f"DEBUG: Dimensões originais: {original_width}x{original_height}")
            
            # Calcular dimensões escaladas
            scaled_width = int((logo_size / original_height) * original_width)
            scaled_height = logo_size
            print(f"DEBUG: Dimensões escaladas: {scaled_width}x{scaled_height}")

            # Calcular posição centralizada
            x_position = (self.width - scaled_width) / 2
            y_position = (self.height - scaled_height) / 2
            print(f"DEBUG: Posição: ({x_position}, {y_position})")

            # Reset do buffer para o início
            img_buffer.seek(0)
            
            # Desenhar imagem
            self.canvas.drawImage(
                ImageReader(img_buffer),
                x_position,
                y_position,
                scaled_width,
                scaled_height,
                mask='auto'
            )
            print("DEBUG: Logo principal desenhado com sucesso!")
            
        except Exception as e:
            print(f"DEBUG: Erro detalhado ao desenhar logo principal: {e}")
            import traceback
            traceback.print_exc()

    def draw_contact_info(self):
        """Desenha informações de contato na capa com estilo ornamentado"""
        
        # Fundo decorativo para informações de contato
        y_center = self.height/2 - 250
        contact_box_height = 120
        box_y = y_center - 60
      
        # Título das informações de contato
        self.canvas.setFont("Helvetica", 12)
        y_pos = self.height/2 - 250
        
        # Telefone com sombra
        phone = self.database.get_phone()
        if phone:
            cleaned = re.sub(r'\D', '', phone)
            if len(cleaned) >= 10:
                formatted_phone = re.sub(r'^(\d{2})(\d{4,5})(\d{4})$', r'(\1) \2-\3', cleaned)
                text = f"Telefone: {formatted_phone}"
                text_width = self.canvas.stringWidth(text, "Helvetica", 12)
                # Sombra do telefone
                self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
                self.canvas.drawString(self.width/2 - text_width/2 + 1, y_pos - 1, text)
                # Texto principal
                self.canvas.setFillColor(self.pallets[self.pallet_select][1])
                self.canvas.drawString(self.width/2 - text_width/2, y_pos, text)
                y_pos -= 20
        
        # Email com sombra
        email = self.database.user_settings.get('email', '')
        if email:
            text = f"Email: {email}"
            text_width = self.canvas.stringWidth(text, "Helvetica", 12)
            # Sombra do email
            self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
            self.canvas.drawString(self.width/2 - text_width/2 + 1, y_pos - 1, text)
            # Texto principal
            self.canvas.setFillColor(self.pallets[self.pallet_select][1])
            self.canvas.drawString(self.width/2 - text_width/2, y_pos, text)
            y_pos -= 20
        
        # Instagram com sombra
        instagram = self.database.user_settings.get('instagram_username', '')
        if instagram:
            text = f"Instagram: @{instagram}"
            text_width = self.canvas.stringWidth(text, "Helvetica", 12)
            # Sombra do instagram
            self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
            self.canvas.drawString(self.width/2 - text_width/2 + 1, y_pos - 1, text)
            # Texto principal
            self.canvas.setFillColor(self.pallets[self.pallet_select][1])
            self.canvas.drawString(self.width/2 - text_width/2, y_pos, text)
            y_pos -= 20
        
        # Website com sombra
        website = self.database.user_settings.get('website_url', '')
        if website:
            text = f"Site: {website}"
            text_width = self.canvas.stringWidth(text, "Helvetica", 12)
            # Sombra do website
            self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
            self.canvas.drawString(self.width/2 - text_width/2 + 1, y_pos - 1, text)
            # Texto principal
            self.canvas.setFillColor(self.pallets[self.pallet_select][1])
            self.canvas.drawString(self.width/2 - text_width/2, y_pos, text)
        
        self.canvas.setFillColorRGB(0,0,0)

    def draw_items(self, lista: list):
        """Desenha os itens na página"""
        image_size = self.width / 6.5
        get_x = lambda x: (170 * x) + 80
        get_y = lambda y: self.height - (210 * y) - 280

        for idy, itemx in enumerate(lista):
            if itemx:
                for idx, itemy in enumerate(itemx):
                    if itemy:
                        # Desenhar imagem do item
                        image_field = itemy.get("image")
                        if image_field:
                            try:
                                image_data_str = image_field.split(",")[1]
                                missing_padding = len(image_data_str) % 4
                                if missing_padding:
                                    image_data_str += '=' * (4 - missing_padding)
                                image_data = base64.b64decode(image_data_str)
                                img_buffer = io.BytesIO(image_data)
                                self.canvas.drawImage(
                                    ImageReader(img_buffer),
                                    get_x(idx),
                                    get_y(idy),
                                    width=image_size,
                                    height=image_size,
                                    mask='auto',
                                    preserveAspectRatio=True,
                                )
                            except Exception as e:
                                print(f"Erro ao desenhar imagem do item {itemy.get('cod')}: {e}")
                        
                        # Desenhar informações do item
                        self.draw_item_info(itemy, get_x(idx), get_y(idy))

    def draw_item_info(self, item, x, y):
        """Desenha as informações de um item"""
        self.canvas.setFont("Helvetica", 8)
        self.canvas.setFillColor(self.pallets[self.pallet_select][1])
        def quebra_linha(texto, limite=30):
            palavras = texto.split(' ')
            linha_atual = ''
            resultado = []
            for palavra in palavras:
                if len(linha_atual) + len(palavra) + (1 if linha_atual else 0) > limite:
                    resultado.append(linha_atual)
                    linha_atual = palavra
                else:
                    if linha_atual:
                        linha_atual += ' ' + palavra
                    else:
                        linha_atual = palavra
            if linha_atual:
                resultado.append(linha_atual)
            return resultado
        description = quebra_linha(f'Descrição: {item.get("item_name")}')
        textos = [f'Código: {item.get("cod")}']
        if item.get("item_name"):
            textos.extend(description)
        # Adicionar informações adicionais se existirem
        additional_infos = item.get("additional_infos", [])
        print(f"DEBUG: Item {item.get('cod')} tem {len(additional_infos)} infos adicionais: {additional_infos}")  # Debug
        if additional_infos:
            for info in additional_infos:
                # Quebrar linha se o texto for muito longo
                info_lines = quebra_linha(info, 25)
                textos.extend(info_lines)
                print(f"DEBUG: Adicionando ao PDF: {info}")  # Debug
        control = 2
        for text in textos:
            if text:
                # Sombra do texto do item
                self.canvas.setFillColorRGB(0.3, 0.3, 0.3)  # Sombra escura
                self.canvas.drawString(x + 1, y - (10 * control) - 1, text)
                # Texto principal do item
                self.canvas.setFillColor(self.pallets[self.pallet_select][1])
                self.canvas.drawString(x, y - (10 * control), text)
                control += 1
        self.canvas.setFillColorRGB(0,0,0)

    def draw_logo_small(self):
        """Desenha o logo pequeno no canto"""
        print("DEBUG: Iniciando draw_logo_small()")
        logo_data = self.database.get_logo()
        if not logo_data:
            print("DEBUG: Nenhum logo disponível para logo pequeno")
            return
            
        try:
            logo_size = 50
            
            # Verificar se o logo já tem o prefixo data:image
            if logo_data.startswith('data:image'):
                image_data_str = logo_data.split(",")[1]
            else:
                # Se não tem prefixo, assumir que já é base64 puro
                image_data_str = logo_data
            
            # Corrigir padding do base64
            missing_padding = len(image_data_str) % 4
            if missing_padding:
                image_data_str += '=' * (4 - missing_padding)
            
            image_data = base64.b64decode(image_data_str)
            img_buffer = io.BytesIO(image_data)
            
            pil_image = Image.open(img_buffer)
            original_width, original_height = pil_image.size
            scaled_width = int((logo_size / original_height) * original_width)
            
            # Reset do buffer para o início
            img_buffer.seek(0)
            
            self.canvas.drawImage(
                ImageReader(img_buffer), 
                40, 
                self.height - logo_size - 25, 
                scaled_width, 
                height=logo_size, 
                mask='auto'
            )
            print("DEBUG: Logo pequeno desenhado com sucesso!")
        except Exception as e:
            print(f"DEBUG: Erro ao desenhar logo pequeno: {e}")
            import traceback
            traceback.print_exc()

def main():
    parser = argparse.ArgumentParser(description='Gera PDF do catálogo')
    parser.add_argument('data_file', type=str, help='Arquivo JSON com dados do catálogo')
    parser.add_argument('output_path', type=str, help='Caminho de saída do PDF')
    args = parser.parse_args()

    try:
        # Carregar dados do arquivo JSON
        with open(args.data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Criar adaptador de banco de dados
        database_adapter = DatabaseAdapter(data)
        
        # Gerar PDF
        pdf_generator = MakePdf(args.output_path, database_adapter)
        output_file = pdf_generator.render_pdf()
        
        print(output_file)  # Rust lerá este output
        
    except Exception as e:
        print(f"ERRO: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
