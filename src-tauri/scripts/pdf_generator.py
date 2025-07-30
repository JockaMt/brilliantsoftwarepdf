import argparse
import base64
import io
import re
import json
import os
import sys
from datetime import datetime
from reportlab.lib.colors import Color as rlColor
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
        
        # Paletas de cores sincronizadas com o frontend
        self.pallet_1 = [rlColor(0.941, 0.988, 0.973), rlColor(0.788, 0.663, 0.380)]  # Classic - background + primary
        self.pallet_2 = [rlColor(0.980, 0.980, 0.980), rlColor(0.753, 0.753, 0.753)]  # Modern - background + primary  
        self.pallet_3 = [rlColor(0.980, 0.941, 0.902), rlColor(0.447, 0.184, 0.216)]  # Luxury - background + primary
        self.pallet_4 = [rlColor(1.0, 0.973, 0.941), rlColor(0.804, 0.498, 0.196)]  # Rose Gold - background + primary
        self.pallet_5 = [rlColor(0.980, 0.980, 0.980), rlColor(0.863, 0.863, 0.863)]  # White Gold - background + primary
        self.pallet_6 = [rlColor(0.973, 0.980, 1.0), rlColor(0.255, 0.412, 0.882)]  # Diamond - background + primary
        self.pallet_7 = [rlColor(0.961, 1.0, 0.980), rlColor(0.314, 0.784, 0.471)]  # Emerald - background + primary
        self.pallet_8 = [rlColor(1.0, 0.941, 0.961), rlColor(0.878, 0.067, 0.373)]  # Ruby - background + primary
        self.pallet_9 = [rlColor(0.941, 0.973, 1.0), rlColor(0.059, 0.322, 0.729)]  # Sapphire - background + primary
        self.pallet_10 = [rlColor(0.992, 0.961, 0.902), rlColor(0.824, 0.412, 0.118)]  # Vintage - background + primary
        
        self.pallets = [self.pallet_1, self.pallet_2, self.pallet_3, self.pallet_4, self.pallet_5, 
                       self.pallet_6, self.pallet_7, self.pallet_8, self.pallet_9, self.pallet_10]
        self.pallet_select = int(database.get_pallet())

    def draw_lines(self, title: str):
        self.canvas.setFont("Helvetica-Bold", 17)
        self.canvas.line(40, 80, 40, 700)
        self.canvas.line(40, 700, 200, 700)
        self.canvas.drawCentredString(self.width/2, 695, title.capitalize())
        self.canvas.line(400, 700, 545, 700)

    def draw_header(self):
        rect = Rect(0, 0, self.width, 100)
        rect.fillColor = self.pallets[self.pallet_select][0]
        rect.strokeWidth = 0
        rect.strokeOpacity = 0
        rect2 = Rect(0, 0, self.width, 35)
        rect2.fillColor = self.pallets[self.pallet_select][0]
        rect2.strokeOpacity = 0
        d = Drawing(0, 0)
        d.add(rect)
        d.drawOn(self.canvas, rect.x, self.height - rect.height)
        d2 = Drawing(0, 0)
        d2.add(rect2)
        d2.drawOn(self.canvas, 0, 0)
        
        dark_rect = Polygon(
            points=[0, 0, 90, 0, 190, rect.height, 0, 100]
        )
        dark_rect.fillColor = self.pallets[self.pallet_select][1]
        dark_rect.strokeWidth = 0
        dark_rect.strokeOpacity = 0
        d2 = Drawing(0, 0)
        d2.add(dark_rect)
        d2.drawOn(self.canvas, 0, self.height - rect.height)
        
        self.canvas.setFont("Helvetica", 9)
        self.canvas.drawRightString(self.width-40, self.height-45, f"{self.database.get_name()}")
        
        # Formatar telefone
        phone = self.database.get_phone()
        if phone:
            cleaned = re.sub(r'\D', '', phone)
            if len(cleaned) >= 10:
                formatted_phone = re.sub(r'^(\d{2})(\d{4,5})(\d{4})$', r'(\1) \2-\3', cleaned)
                self.canvas.drawRightString(self.width-40, self.height-60, f"Contato: {formatted_phone}")

    def draw_page_number(self):
        page_num_text = f"{self.page_number}"
        self.canvas.drawRightString(self.width - 40, 15, page_num_text)
        self.canvas.setFont("Courier-Oblique", size=8)
        name = "Feito com Brilliant Software © - Contatos: (28) 98113-7532 - Instagram: @brilliantsoftware"
        text_width = self.canvas.stringWidth(name, "Courier-Oblique", 8)
        self.canvas.drawString(self.width/2 - text_width/2, 15, name)
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
        
        # Polígonos decorativos
        dark_rect = Polygon(
            points=[0, self.height, 190, self.height, 0, self.height-190]
        )
        dark_rect.fillColor = self.pallets[self.pallet_select][1]
        dark_rect.strokeWidth = 0
        dark_rect.strokeOpacity = 0
        d = Drawing(0, 0)
        d.add(dark_rect)
        d.drawOn(self.canvas, 0, 0)
        
        dark_rect2 = Polygon(
            points=[self.width, 190, self.width, 0, self.width-190, 0]
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
        
        # Nome da empresa
        self.canvas.setFont("Helvetica-Bold", 18)
        name = self.database.get_name()
        text_width = self.canvas.stringWidth(name, "Helvetica-Bold", 18)
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
        """Desenha informações de contato na capa"""
        self.canvas.setFont("Helvetica", 12)
        y_pos = self.height/2 - 250
        
        # Telefone
        phone = self.database.get_phone()
        if phone:
            cleaned = re.sub(r'\D', '', phone)
            if len(cleaned) >= 10:
                formatted_phone = re.sub(r'^(\d{2})(\d{4,5})(\d{4})$', r'(\1) \2-\3', cleaned)
                text_width = self.canvas.stringWidth(f"Telefone: {formatted_phone}", "Helvetica", 12)
                self.canvas.drawString(self.width/2 - text_width/2, y_pos, f"Telefone: {formatted_phone}")
                y_pos -= 20
        
        # Email
        email = self.database.user_settings.get('email', '')
        if email:
            text_width = self.canvas.stringWidth(f"Email: {email}", "Helvetica", 12)
            self.canvas.drawString(self.width/2 - text_width/2, y_pos, f"Email: {email}")
            y_pos -= 20
        
        # Instagram
        instagram = self.database.user_settings.get('instagram_username', '')
        if instagram:
            text_width = self.canvas.stringWidth(f"Instagram: @{instagram}", "Helvetica", 12)
            self.canvas.drawString(self.width/2 - text_width/2, y_pos, f"Instagram: @{instagram}")
            y_pos -= 20
        
        # Website
        website = self.database.user_settings.get('website_url', '')
        if website:
            text_width = self.canvas.stringWidth(f"Site: {website}", "Helvetica", 12)
            self.canvas.drawString(self.width/2 - text_width/2, y_pos, f"Site: {website}")

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
                self.canvas.drawString(x, y - (10 * control), text)
                control += 1

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
