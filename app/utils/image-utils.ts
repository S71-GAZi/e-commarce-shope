// utils/image-utils.ts or top of file (outside component)
export const base64ToFile = (base64: any, filename = "sample.jpg"): File | null => {
    if (!base64) return null
    try {
        const [header, data] = base64.split(",")
        if (!header || !data) return null
        const mimeMatch = header.match(/:(.*?);/)
        const mime = mimeMatch?.[1] || "image/jpeg"
        const extension = mime.split("/")[1] || "jpg"
        const binary = atob(data)
        const array = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i)
        }
        return new File([array], filename.replace(/\.\w+$/, `.${extension}`), { type: mime })
    } catch (err) {
        console.error("Failed to convert base64 to File:", err)
        return null
    }
}