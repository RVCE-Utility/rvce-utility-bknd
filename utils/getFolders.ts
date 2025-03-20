export const searchFolderStructure = (query: string, data: any) => {
  // Helper function to deep clone objects
  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  const searchInTree = (nodes: any): any[] => {
    let results: any[] = [];

    for (const node of nodes) {
      // If folder name matches, return entire subtree
      if (
        node.mimeType === "application/vnd.google-apps.folder" &&
        node.name.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push(deepClone(node));
        continue;
      }

      // If has children, search them
      if (node.children && node.children.length > 0) {
        const childResults = searchInTree(node.children);
        if (childResults.length > 0) {
          results = [...results, ...childResults];
        }
      }
    }

    return results;
  };

  return searchInTree(data);
};
