# Extract English content
python .\extract_trans_text.py "file address"

e.g. python .\extract_trans_text.py "D:\EMBER\01_Work\Glassbox\HSBC-POC\frontend\templates\Avoiding Cheque Scams _ Cyber Security And Fraud - HSBC HK.html"

# Replace English content with Chinese
python .\replace_with_dict.py "GENERATED_trans.txt" "English dictionary address" "Chinese dictionary address"

e.g. python .\replace_with_dict.py "D:\EMBER\01_Work\Glassbox\HSBC-POC\frontend\templates\Avoiding Cheque Scams _ Cyber Security And Fraud - HSBC HK_trans.txt" "D:\EMBER\01_Work\Glassbox\HSBC-POC\scripts\dict_en.txt" "D:\EMBER\01_Work\Glassbox\HSBC-POC\scripts\dict_cn.txt"

Finish whatever is left that need to be translated. Once everything is in Chinese, proceed to next step.

# Replace original HTML with translated text
python .\replace_trans_text.py "original HTML file" "translated file"

e.g. python .\replace_trans_text.py "D:\EMBER\01_Work\Glassbox\HSBC-POC\frontend\templates\Avoiding Cheque Scams _ Cyber Security And Fraud - HSBC HK.html" "D:\EMBER\01_Work\Glassbox\HSBC-POC\frontend\templates\Avoiding Cheque Scams _ Cyber Security And Fraud - HSBC HK_trans_replaced.txt"