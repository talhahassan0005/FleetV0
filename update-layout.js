const fs = require('fs');

function replaceClass(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');

  text = text.replace(
    'className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]"',
    'className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"'
  );
  
  text = text.replace(
    'className="lg:col-span-1 card overflow-y-auto"',
    'className="w-full lg:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/50"'
  );

  text = text.replace(
    'className="lg:col-span-3 card flex flex-col"',
    'className="flex-1 flex flex-col bg-white relative"'
  );

  fs.writeFileSync(filePath, text);
}

replaceClass('d:/Data1/Data1/Projects/web-desktop/MathewV2/MathewV2/src/app/client/chat/page.tsx');
replaceClass('d:/Data1/Data1/Projects/web-desktop/MathewV2/MathewV2/src/app/transporter/chat/page.tsx');
console.log('done layout!');
