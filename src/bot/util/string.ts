function addInfoToString(str: string, info: { [str: string]: string }): string {
    for (const [key, value] of Object.entries(info)) {
        str = str.replace(new RegExp(`{${key}}`, "g"), value);
    }

    return str;
}

export {
    addInfoToString
}