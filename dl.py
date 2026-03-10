import urllib.request
import os
import time
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36' }

logos = [
  ("hikvision.png", "https://logo.clearbit.com/hikvision.com"),
  ("coconut.png", "https://media.licdn.com/dms/image/v2/C4E0BAQGU_pb0KZXuxg/company-logo_200_200/company-logo_200_200/0/1630627177416/coconut_media_box_logo?e=2147483647&v=beta&t=rEvtLlb_dCA5nocnhWiY0OeRj1Hd_0u4ePf11CtBlho"),
  ("rp.png", "https://logo.clearbit.com/rpenterprises.com"),
  ("sai.png", "https://logo.clearbit.com/saiconstructionca.com"),
  ("navbharat.png", "https://logo.clearbit.com/navbharattrading.com"),
  ("spice.png", "https://logo.clearbit.com/spicetelecom.com"),
  ("gsi.webp", "https://cdn.rt.emap.com/wp-content/uploads/sites/3/2025/05/28092250/GSI.webp"),
  ("shree.png", "https://logo.clearbit.com/shreerajchemicals.com"),
  ("oren.png", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5mLvHWSF6WPbNSi6RcBdqxRYUBLJYQj3EKg&s"),
  ("canara.png", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Canara_Bank_Logo.svg/512px-Canara_Bank_Logo.svg.png"),
  ("cbi.png", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Central_Bank_of_India_Logo.svg/512px-Central_Bank_of_India_Logo.svg.png"),
  ("tpl.png", "https://logo.clearbit.com/tplplastech.in"),
  ("godrej.png", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Godrej_Logo.svg/512px-Godrej_Logo.svg.png"),
  ("oheya.png", "https://logo.clearbit.com/haihospitality.com"),
  ("aec.png", "https://media.licdn.com/dms/image/v2/C560BAQHWkJZG1F6Arg/company-logo_200_200/company-logo_200_200/0/1631855046714?e=2147483647&v=beta&t=c5CC763qODzeEbVXWGNswFouB2mFrOKd6BvHcj3S4fo"),
  ("shari.png", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt8bUlsQiJk3y5ZqUToFPEHzsuKs3vm7yGpw&s"),
  ("ecplaza.png", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjh-ULbXaDyNSexsHt-P9jH11zv-f5M3xVZg&s"),
  ("bmbuildcon.png", "https://logo.clearbit.com/bmbuildcon.com"),
  ("khatri.png", "https://logo.clearbit.com/khatriinteriors.com"),
  ("fairfield.png", "https://logo.clearbit.com/fairfield.marriott.com"),
  ("dmart.png", "https://logo.clearbit.com/dmartindia.com"),
  ("hind.png", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfESrtmXLjSPa62jijHJKBY9FoDeMxbZBWuA&s"),
  ("tax2win.png", "https://logo.clearbit.com/tax2win.in")
]

os.makedirs('images/clients', exist_ok=True)
os.makedirs('public/images/clients', exist_ok=True)

success = []
for name, url in logos:
  try:
    path = f'images/clients/{name}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response, open(path, 'wb') as out_file:
      out_file.write(response.read())
    with open(f'public/images/clients/{name}', 'wb') as fb:
      with open(path, 'rb') as fa:
        fb.write(fa.read())
    success.append(name)
    print(f"OK: {name}")
  except Exception as e:
    print(f"FAIL: {name} - {str(e)}")

print(f"Successfully downloaded {len(success)} of {len(logos)} logos.")
