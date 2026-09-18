import os

wallet_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/lib/wallet-data.ts'

with open(wallet_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace DEMO_FAMILY definition with an import
if 'import { mockFamilyMembers' not in content:
    content = content.replace('export const DEMO_FAMILY: FamilyMember[] = [', 'import { mockFamilyMembers } from "@/lib/mock-data";\n\nexport const DEMO_FAMILY: FamilyMember[] = mockFamilyMembers.map(m => ({\n  id: m.id,\n  name: m.name,\n  age: m.age,\n  gender: m.gender,\n  relation: m.relationship,\n  village: "Navjeevan Gram"\n}));\n\nconst old_DEMO_FAMILY = [')
    
    # Replace fam-00X with member-X in DEMO_TIMELINE
    content = content.replace('fam-001', 'member-ramesh')
    content = content.replace('fam-002', 'member-sita')
    content = content.replace('fam-003', 'member-aarav')

    with open(wallet_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated wallet-data to use centralized demo family")
