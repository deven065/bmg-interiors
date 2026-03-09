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
  ("coconut.png", "https://logo.clearbit.com/coconutmediabox.com"),
  ("rp.png", "https://logo.clearbit.com/rpenterprises.com"),
  ("sai.png", "https://logo.clearbit.com/saiconstructionca.com"),
  ("navbharat.png", "https://logo.clearbit.com/navbharattrading.com"),
  ("spice.png", "https://logo.clearbit.com/spicetelecom.com"),
  ("gsi.png", "https://logo.clearbit.com/gemscience.net"),
  ("shree.png", "https://logo.clearbit.com/shreerajchemicals.com"),
  ("oren.png", "https://logo.clearbit.com/orenkitchenworld.com"),
  ("canara.png", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Canara_Bank_Logo.svg/512px-Canara_Bank_Logo.svg.png"),
  ("cbi.png", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Central_Bank_of_India_Logo.svg/512px-Central_Bank_of_India_Logo.svg.png"),
  ("tpl.png", "https://logo.clearbit.com/tplplastech.in"),
  ("godrej.png", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Godrej_Logo.svg/512px-Godrej_Logo.svg.png"),
  ("oheya.png", "https://logo.clearbit.com/haihospitality.com"),
  ("aec.png", "https://logo.clearbit.com/aecpvtltd.com"),
  ("shari.png", "https://logo.clearbit.com/shariacademy.com"),
  ("ecplaza.png", "https://logo.clearbit.com/ecplaza.net"),
  ("bmbuildcon.png", "https://logo.clearbit.com/bmbuildcon.com"),
  ("khatri.png", "https://logo.clearbit.com/khatriinteriors.com"),
  ("fairfield.png", "https://logo.clearbit.com/fairfield.marriott.com"),
  ("dmart.png", "https://logo.clearbit.com/dmartindia.com"),
  ("hind.png", "https://logo.clearbit.com/hirect.com"),
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
