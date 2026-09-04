import re
import argparse
import os

def extract_trans_text(input_file, output_file=None):
    """
    從文件中提取 {% trans %} 和 {% endtrans %} 之間的文本，保存到輸出文件。
    輸出文件名基於輸入文件名，格式為 {輸入文件名}_trans.txt。
    
    Args:
        input_file (str): 輸入文件路徑
        output_file (str, optional): 輸出文件路徑，若未提供則基於輸入文件名生成
    """
    try:
        # 如果未提供輸出文件名，生成基於輸入文件名的文件名
        if output_file is None:
            base_name = os.path.splitext(input_file)[0]  # 獲取文件名（不含擴展名）
            output_file = f"{base_name}_trans.txt"      # 附加 _trans.txt
        
        # 讀取輸入文件內容
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 使用正則表達式匹配 {% trans %} 和 {% endtrans %} 之間的內容
        pattern = r'{%\s*trans\s*%}(.*?){%\s*endtrans\s*%}'
        matches = re.findall(pattern, content, re.DOTALL)
        
        # 清理提取的文本（去除多餘的空白和換行）
        trans_texts = [text.strip() for text in matches]
        
        # 如果沒有找到匹配項
        if not trans_texts:
            print("未找到任何 {% trans %}...{% endtrans %} 的內容。")
            return
        
        # 將提取的文本寫入輸出文件，每行一條
        with open(output_file, 'w', encoding='utf-8') as f:
            for text in trans_texts:
                f.write(f"{text}\n")
        
        print(f"成功提取 {len(trans_texts)} 條文本，保存到 {output_file}")
        
    except FileNotFoundError:
        print(f"錯誤：輸入文件 {input_file} 不存在。")
    except Exception as e:
        print(f"發生錯誤：{str(e)}")

def main():
    # 設置命令行參數
    parser = argparse.ArgumentParser(description="提取文件中 {% trans %} 和 {% endtrans %} 之間的文本")
    parser.add_argument('input_file', help="輸入文件路徑（例如 template.html）")
    parser.add_argument('--output', help="輸出文件路徑（可選，若未提供則使用輸入文件名_trans.txt）")
    args = parser.parse_args()
    
    # 調用提取函數
    extract_trans_text(args.input_file, args.output)

if __name__ == "__main__":
    main()