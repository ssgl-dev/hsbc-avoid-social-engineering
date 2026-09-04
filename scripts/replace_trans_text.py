import re
import argparse
import os

def replace_trans_text(source_file, trans_file, output_file=None):
    """
    將提取的文本按順序放回源文件的 {% trans %}...{% endtrans %} 塊中，保存到輸出文件。
    輸出文件名基於源文件名，格式為 {source_file}_replaced.html。
    
    Args:
        source_file (str): 源文件路徑（包含 {% trans %}...{% endtrans %}）
        trans_file (str): 提取的文本文件路徑
        output_file (str, optional): 輸出文件路徑，若未提供則使用 {source_file}_replaced.html
    """
    try:
        # 如果未提供輸出文件名，生成基於源文件名的文件名
        if output_file is None:
            base_name = os.path.splitext(source_file)[0]
            output_file = f"{base_name}_replaced.html"
        
        # 讀取源文件內容
        with open(source_file, 'r', encoding='utf-8') as f:
            source_content = f.read()
        
        # 讀取提取的文本文件內容
        with open(trans_file, 'r', encoding='utf-8') as f:
            trans_texts = [line.strip() for line in f if line.strip()]
        
        # 使用正則表達式查找所有 {% trans %}...{% endtrans %} 塊及其位置
        pattern = r'{%\s*trans\s*%}(.*?){%\s*endtrans\s*%}'
        matches = list(re.finditer(pattern, source_content, re.DOTALL))
        
        # 檢查提取的文本數量是否與源文件的 {% trans %} 塊數匹配
        if len(trans_texts) != len(matches):
            print(f"錯誤：提取的文本行數 ({len(trans_texts)}) 與源文件的 {{% trans %}} 塊數 ({len(matches)}) 不匹配。")
            return
        
        # 按順序替換 {% trans %}...{% endtrans %} 塊
        result_content = source_content
        offset = 0  # 跟踪內容偏移量
        for i, match in enumerate(matches):
            start, end = match.span()
            trans_text = trans_texts[i]
            # 構建替換字符串
            replacement = f"{{% trans %}}{trans_text}{{% endtrans %}}"
            # 替換當前塊
            result_content = result_content[:start + offset] + replacement + result_content[end + offset:]
            # 更新偏移量（考慮替換後的長度變化）
            offset += len(replacement) - (end - start)
        
        # 將替換後的內容寫入輸出文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(result_content)
        
        print(f"成功將 {len(trans_texts)} 條文本放回源文件，保存到 {output_file}")
        
    except FileNotFoundError as e:
        print(f"錯誤：文件 {e.filename} 不存在。")
    except Exception as e:
        print(f"發生錯誤：{str(e)}")

def main():
    # 設置命令行參數
    parser = argparse.ArgumentParser(description="將提取的文本按順序放回源文件的 {% trans %}...{% endtrans %} 塊中")
    parser.add_argument('source_file', help="源文件路徑（例如 template.html）")
    parser.add_argument('trans_file', help="提取的文本文件路徑（例如 template_trans.txt）")
    parser.add_argument('--output', help="輸出文件路徑（可選，若未提供則使用 {source_file}_replaced.html）")
    args = parser.parse_args()
    
    # 調用替換函數
    replace_trans_text(args.source_file, args.trans_file, args.output)

if __name__ == "__main__":
    main()