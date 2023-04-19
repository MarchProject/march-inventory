export const csvToJson = (csv: string): Record<string, any>[] => {
  const lines: string[] = csv.split("\n")
  const result: Record<string, string>[] = []
  const headers: string[] = lines[0]
    .split(/(,)(?=(?:[^"]|"[^"]*")*$)/g)
    ?.filter(elem => elem !== ',') ?? []
  for (let i = 1; i < lines.length; i++) {
    const obj: Record<string, string> = {}
    const currentLine: string[] = lines[i]
      .split(/(,)(?=(?:[^"]|"[^"]*")*$)/g)
      ?.filter(elem => elem !== ',') ?? []
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j]
    }
    result.push(obj)
  }

  return result;
}

export const sanitizeCsv = str => {
  if (!str) return "";

  const firstChar = str.charAt(0);
  const isInjected = ["=", "+", "-", "@"].includes(firstChar);

  if (!isInjected) return str;

  const slicedStr = str.slice(1);

  return sanitizeCsv(slicedStr);
};


export const jsonToCSV = (data: Record<string, string | number>[], headers?: string[]) => {
  const csv = data.map(row => Object.values(row).map(value => `"${value}"`));
  if (headers) {
    csv.unshift(headers.map(value => `"${value}"`));
  } else {
    csv.unshift(Object.keys(data[0]).map(value => `"${value}"`));
  }
  return `${csv.join('\n')}`;
}