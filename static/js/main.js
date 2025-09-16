let lastUrl = null; // 保存上一次生成的URL
let mergedBlob = null; // 保存合成后的PDF的Blob对象
let buttonContainer = null; // 保存下载和打印按钮的容器

// 监听文件输入框的change事件
document.getElementById('pdf1').addEventListener('change', clearPreviousResult);
document.getElementById('pdf2').addEventListener('change', clearPreviousResult);

async function mergePDFsVertically() {
    const status = document.getElementById('status');
    status.textContent = '正在处理...';

    const file1 = document.getElementById('pdf1').files[0];
    const file2 = document.getElementById('pdf2').files[0];

    if (!file1 || !file2) {
        status.textContent = '请上传两个PDF文件！';
        return;
    }

    try {
        const pdf1Bytes = await file1.arrayBuffer();
        const pdf2Bytes = await file2.arrayBuffer();

        const { PDFDocument } = PDFLib;
        const pdfDoc1 = await PDFDocument.load(pdf1Bytes);
        const pdfDoc2 = await PDFDocument.load(pdf2Bytes);

        const mergedPdf = await PDFDocument.create();

        const pageCount1 = pdfDoc1.getPageCount();
        const pageCount2 = pdfDoc2.getPageCount();
        const maxPages = Math.min(pageCount1, pageCount2);

        for (let i = 0; i < maxPages; i++) {
            const page1 = pdfDoc1.getPage(i);
            const page2 = pdfDoc2.getPage(i);

            const width1 = page1.getWidth();
            const height1 = page1.getHeight();
            const width2 = page2.getWidth();
            const height2 = page2.getHeight();

            const newWidth = Math.max(width1, width2);
            const newHeight = height1 + height2;

            const newPage = mergedPdf.addPage([newWidth, newHeight]);

            const embeddedPage1 = await mergedPdf.embedPage(page1);
            newPage.drawPage(embeddedPage1, {
                x: (newWidth - width1) / 2,
                y: height2,
                width: width1,
                height: height1
            });

            const embeddedPage2 = await mergedPdf.embedPage(page2);
            newPage.drawPage(embeddedPage2, {
                x: (newWidth - width2) / 2,
                y: 0,
                width: width2,
                height: height2
            });
        }

        const mergedPdfBytes = await mergedPdf.save();
        mergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

        // 清理上一次的URL
        if (lastUrl) URL.revokeObjectURL(lastUrl);

        status.textContent = 'PDF合成成功！';

        // 检查按钮容器是否已经存在，如果不存在则创建
        if (!buttonContainer) {
            buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-group');

            const downloadButton = document.createElement('button');
            downloadButton.classList.add('action-btn', 'merge-btn');
            downloadButton.textContent = '下载合成的PDF';
            downloadButton.addEventListener('click', downloadMergedPDF);

            const printButton = document.createElement('button');
            printButton.classList.add('action-btn', 'clear-result-btn');
            printButton.textContent = '打印合成的PDF';
            printButton.addEventListener('click', printMergedPDF);

            buttonContainer.appendChild(downloadButton);
            buttonContainer.appendChild(printButton);

            const statusDiv = document.getElementById('status');
            statusDiv.parentNode.insertBefore(buttonContainer, statusDiv.nextSibling);
        }

    } catch (error) {
        console.error(error);
        status.textContent = '合成失败，请重试！';
    }
}

function clearFile(inputId) {
    const input = document.getElementById(inputId);
    input.value = ''; // 清除文件输入
    document.getElementById('status').textContent = '';
}

function clearResult() {
    if (lastUrl) {
        URL.revokeObjectURL(lastUrl); // 撤销生成的URL
        lastUrl = null;
    }
    if (buttonContainer) {
        buttonContainer.parentNode.removeChild(buttonContainer); // 移除下载和打印按钮
        buttonContainer = null;
    }
    mergedBlob = null; // 清空合成后的PDF的Blob对象
    document.getElementById('status').textContent = '已清除合成结果';
}

// 合规标签模板AI矢量图 下载页
function tiaoma_hegui() {
    var targetUrl = "https://wwls.lanzoue.com/iEiV62yc8e5g";
    window.open(targetUrl, '_blank');
}

// 下载合成的PDF
function downloadMergedPDF() {
    if (mergedBlob) {
        // 提示用户输入文件名
        let fileName = prompt('请输入保存的文件名（无需添加.pdf后缀）：', 'PDF_vertically');
        if (!fileName) fileName = 'PDF_vertically'; // 默认文件名
        fileName = fileName.trim().replace(/\.pdf$/i, '') + '.pdf'; // 确保以.pdf结尾

        // 生成并下载文件
        lastUrl = URL.createObjectURL(mergedBlob);
        const link = document.createElement('a');
        link.href = lastUrl;
        link.download = fileName;
        link.click();
    }
}

// 打印合成的PDF
function printMergedPDF() {
    if (mergedBlob) {
        lastUrl = URL.createObjectURL(mergedBlob);
        const newWindow = window.open(lastUrl, '_blank');
        if (newWindow) {
            newWindow.onload = function () {
                try {
                    newWindow.print();
                } catch (error) {
                    console.error('打印失败:', error);
                    alert('打印失败，请更换另外的打印方式！');
                }
            };
            newWindow.onerror = function () {
                console.error('PDF加载失败');
                alert('PDF加载失败，请重试！');
            };
        } else {
            alert('无法打开新窗口，请检查浏览器设置。');
        }
    }
}

// 清除之前合成的结果
function clearPreviousResult() {
    if (lastUrl || mergedBlob || buttonContainer) {
        clearResult();
    }
}