import os

base = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src'
caremap_component = base + '/components/caremap/CareMap.tsx'
citizen_page = base + '/app/(dashboard)/citizen/care-map/page.tsx'
asha_page = base + '/app/(dashboard)/asha/care-map/page.tsx'

os.makedirs(os.path.dirname(caremap_component), exist_ok=True)
os.makedirs(os.path.dirname(asha_page), exist_ok=True)

with open(citizen_page, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify content for component
content = content.replace('export default function CareMap()', 'export function CareMap()')

with open(caremap_component, 'w', encoding='utf-8') as f:
    f.write(content)

page_content = '"use client";\nimport { CareMap } from "@/components/caremap/CareMap";\n\nexport default function Page() {\n  return <CareMap />;\n}\n'

with open(citizen_page, 'w', encoding='utf-8') as f:
    f.write(page_content)

with open(asha_page, 'w', encoding='utf-8') as f:
    f.write(page_content)

print('Shared component created.')
