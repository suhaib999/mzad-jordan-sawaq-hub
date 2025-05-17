
// Helper function to parse the cars.txt file into a structure of makes and models
export function parseCarTextFile(carText: string) {
  const makes: { name: string; models: string[] }[] = [];
  let currentMake: { name: string; models: string[] } | null = null;
  
  // Split by lines
  const lines = carText.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this is a make (starts with ##)
    if (line.startsWith('##')) {
      const makeName = line.replace('##', '').trim();
      currentMake = { name: makeName, models: [] };
      makes.push(currentMake);
    } 
    // Check if this is a model (starts with -)
    else if (line.startsWith('-') && currentMake) {
      const modelName = line.replace('-', '').trim();
      currentMake.models.push(modelName);
    }
  }
  
  return makes;
}
