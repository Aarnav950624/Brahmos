import os

role_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/role-selection/page.tsx'

with open(role_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'Reset Demo Data' not in content:
    # We need to import resetDemoData and Database icon
    content = content.replace('import { Card, CardContent } from "@/components/ui/card";', 'import { Card, CardContent } from "@/components/ui/card";\nimport { resetDemoData } from "@/lib/mock-data";\nimport { Database } from "lucide-react";')
    
    # Find the closing div of the main container and add a button
    # The main container ends just before the last </div>
    parts = content.rsplit('</div>', 1)
    
    reset_ui = '''
      <div className="mt-8 text-center border-t border-slate-200 pt-6 max-w-md mx-auto">
        <p className="text-xs text-slate-500 mb-3 flex items-center justify-center gap-1.5">
          <Database className="h-3 w-3" /> Aggregated Synthetic Demo Data Environment
        </p>
        <button 
          onClick={resetDemoData}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full transition-colors border border-rose-200"
        >
          Reset Demo Data
        </button>
      </div>
    </div>'''
    
    content = parts[0] + reset_ui
    
    with open(role_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated Role Selection with Reset Demo Data")
