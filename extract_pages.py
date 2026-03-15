from pypdf import PdfReader
import os

reader = PdfReader('/Users/user/Library/CloudStorage/OneDrive-LycéeNotreDamedeBoulogne/Liste Tribut-Bouillet.pdf')
outdir = '/Users/user/mario-rikart/core-astro/public/images/trombi'
os.makedirs(outdir, exist_ok=True)

for i, page in enumerate(reader.pages):
    xobjs = page['/Resources']['/XObject']
    for key in xobjs:
        img_obj = xobjs[key]
        data = img_obj.get_data()
        w = img_obj['/Width']
        h = img_obj['/Height']
        fname = os.path.join(outdir, 'page_' + str(i+1) + '.jpg')
        with open(fname, 'wb') as f:
            f.write(data)
        print('Page ' + str(i+1) + ': ' + str(w) + 'x' + str(h) + ' -> ' + fname)

print('Done!')
