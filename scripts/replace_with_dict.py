import argparse
import os

def replace_with_dict(trans_file, dict_en_file, dict_cn_file, output_file=None):
    """
    將提取的文本文件中與 dict_en.txt 相同的行替換為 dict_cn.txt 中對應的行，保存到輸出文件。
    輸出文件名基於輸入文本文件名，格式為 {trans_file}_replaced.txt。
    
    Args:
        trans_file (str): 提取的文本文件路徑（例如 xxx_trans.txt）
        dict_en_file (str): 英文翻譯文件路徑（dict_en.txt）
        dict_cn_file (str): 中文翻譯文件路徑（dict_cn.txt）
        output_file (str, optional): 輸出文件路徑，若未提供則使用 {trans_file}_replaced.txt
    """
    try:
        # 如果未提供輸出文件名，生成基於輸入文本文件名的文件名
        if output_file is None:
            base_name = os.path.splitext(trans_file)[0]
            output_file = f"{base_name}_replaced.txt"
        
        # 讀取提取的文本文件
        with open(trans_file, 'r', encoding='utf-8') as f:
            trans_lines = [line.strip() for line in f if line.strip()]
        
        # 讀取 dict_en.txt 和 dict_cn.txt
        with open(dict_en_file, 'r', encoding='utf-8') as f:
            dict_en_lines = [line.strip() for line in f if line.strip()]
        
        with open(dict_cn_file, 'r', encoding='utf-8') as f:
            dict_cn_lines = [line.strip() for line in f if line.strip()]
        
        # 檢查 dict_en.txt 和 dict_cn.txt 的行數是否相同
        if len(dict_en_lines) != len(dict_cn_lines):
            print(f"錯誤：{dict_en_file} 的行數 ({len(dict_en_lines)}) 與 {dict_cn_file} 的行數 ({len(dict_cn_lines)}) 不匹配。")
            return
        
        # 創建英中翻譯對應的字典
        en_to_cn = dict(zip(dict_en_lines, dict_cn_lines))
        
        # 替換匹配的行
        replaced_lines = []
        replace_count = 0
        for line in trans_lines:
            if line in en_to_cn:
                replaced_lines.append(en_to_cn[line])
                replace_count += 1
            else:
                replaced_lines.append(line)
        
        # 將替換後的內容寫入輸出文件
        with open(output_file, 'w', encoding='utf-8') as f:
            for line in replaced_lines:
                f.write(f"{line}\n")
        
        print(f"成功處理 {len(trans_lines)} 條文本，替換 {replace_count} 條匹配行，保存到 {output_file}")
        
    except FileNotFoundError as e:
        print(f"錯誤：文件 {e.filename} 不存在。")
    except Exception as e:
        print(f"發生錯誤：{str(e)}")

def main():
    # 設置命令行參數
    parser = argparse.ArgumentParser(description="將提取的文本文件中與 dict_en.txt 相同的行替換為 dict_cn.txt 中對應的行")
    parser.add_argument('trans_file', help="提取的文本文件路徑（例如 xxx_trans.txt）")
    parser.add_argument('dict_en_file', help="英文翻譯文件路徑（dict_en.txt）")
    parser.add_argument('dict_cn_file', help="中文翻譯文件路徑（dict_cn.txt）")
    parser.add_argument('--output', help="輸出文件路徑（可選，若未提供則使用 {trans_file}_replaced.txt）")
    args = parser.parse_args()
    
    # 調用替換函數
    replace_with_dict(args.trans_file, args.dict_en_file, args.dict_cn_file, args.output)

if __name__ == "__main__":
    main()