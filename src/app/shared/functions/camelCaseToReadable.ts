export function camelCaseToReadable(value: string): string{
    let nameModified = ""
    for (const c of value){
        if (c.toUpperCase() === c && nameModified.length != 0){
            nameModified += " " + c.toUpperCase();
        }else if (nameModified.length === 0){
            nameModified += c.toUpperCase();
        }else{
            nameModified += c;
        }
    }
    return nameModified;
}