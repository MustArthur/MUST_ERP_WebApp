import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

async function captureNode(node: HTMLElement): Promise<{ dataUrl: string; width: number; height: number }> {
    const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#ffffff' })
    return { dataUrl, width: node.offsetWidth, height: node.offsetHeight }
}

export async function exportRecipeAsImage(node: HTMLElement, filename: string): Promise<void> {
    const { dataUrl } = await captureNode(node)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${filename}.png`
    link.click()
}

export async function exportRecipeAsPdf(node: HTMLElement, filename: string): Promise<void> {
    const { dataUrl, width, height } = await captureNode(node)
    const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
    pdf.save(`${filename}.pdf`)
}
