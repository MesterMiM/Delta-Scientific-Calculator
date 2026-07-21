let currentInput = "0";
let isShiftActive = false;
let historyList = [];

const resultDisplay = document.getElementById("result");
const historyDisplay = document.getElementById("history");
const shiftIndicator = document.getElementById("shift-indicator");

function showHistory() {
    const modal = document.getElementById('history-modal');
    const listDiv = document.getElementById('history-list');
    listDiv.innerHTML = '';
    
    if (historyList.length === 0) {
        listDiv.innerHTML = '<div class="history-item" style="text-align:center;">No history yet</div>';
    } else {
        [...historyList].reverse().forEach(item => {
            let div = document.createElement('div');
            div.className = 'history-item';
            div.innerText = item;
            listDiv.appendChild(div);
        });
    }
    modal.style.display = 'flex';
}

function closeHistoryModal() {
    document.getElementById('history-modal').style.display = 'none';
}

function updateDisplay() {
    resultDisplay.innerText = currentInput;
    
    // ۱. تغییر خودکار سایز فونت بر اساس طول رشته
    let len = currentInput.length;
    if (len < 12) {
        resultDisplay.style.fontSize = "32px"; // سایز پیش‌فرض
    } else if (len < 24) {
        resultDisplay.style.fontSize = "24px"; // سایز متوسط
    } else if (len < 40) {
        resultDisplay.style.fontSize = "18px"; // سایز کوچک
    } else {
        resultDisplay.style.fontSize = "14px"; // حداقل سایز فونت (برای جلوگیری از ناخوانا شدن)
    }

    // ۲. اسکرول خودکار به آخرین ورودی (پایین)
    resultDisplay.scrollTop = resultDisplay.scrollHeight;
}


function appendValue(val) {
    if (currentInput === "0" && val !== "." && val !== "^2" && val !== "^") {
        currentInput = val;
    } else {
        currentInput += val;
    }
    updateDisplay();
}

function appendSci(normalFunc, shiftFunc) {
    let func = isShiftActive ? shiftFunc : normalFunc;
    
    if(func === '^2' || func === '^' || func === 'π' || func === 'e') {
        appendValue(func);
    } else {
        appendValue(func + "(");
    }

    if(isShiftActive) toggleShift();
}

function toggleShift() {
    isShiftActive = !isShiftActive;
    shiftIndicator.innerText = isShiftActive ? "S" : "";
}

function clearAll() {
    currentInput = "0";
    historyDisplay.innerText = "";
    isShiftActive = false;
    shiftIndicator.innerText = "";
    updateDisplay();
}

function deleteChar() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = "0";
    }
    updateDisplay();
}

function calculateResult() {
    try {
        if (currentInput === "") return;

        // تعریف توابع مثلثاتی اختصاصی بر اساس درجه
        const sinDeg = (deg) => Math.sin(deg * (Math.PI / 180));
        const cosDeg = (deg) => Math.cos(deg * (Math.PI / 180));
        const tanDeg = (deg) => Math.tan(deg * (Math.PI / 180));
        
        // تعریف توابع معکوس مثلثاتی (خروجی بر اساس درجه)
        const asinDeg = (val) => Math.asin(val) * (180 / Math.PI);
        const acosDeg = (val) => Math.acos(val) * (180 / Math.PI);
        const atanDeg = (val) => Math.atan(val) * (180 / Math.PI);

        // جایگزینی عبارات
        let mathExpression = currentInput
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/π/g, "Math.PI")
            .replace(/e/g, "Math.E")
            .replace(/\^2/g, "**2")
            .replace(/\^/g, "**")
            .replace(/sqrt\(/g, "Math.sqrt(")
            .replace(/cbrt\(/g, "Math.cbrt(")
            // نکته مهم: توابع دارای a (مثل asin) حتماً باید قبل از توابع اصلی (مثل sin) جایگزین شوند تا تداخل ایجاد نشود
            .replace(/asin\(/g, "asinDeg(")
            .replace(/acos\(/g, "acosDeg(")
            .replace(/atan\(/g, "atanDeg(")
            .replace(/sin\(/g, "sinDeg(")
            .replace(/cos\(/g, "cosDeg(")
            .replace(/tan\(/g, "tanDeg(")
            .replace(/log\(/g, "Math.log10(")
            .replace(/ln\(/g, "Math.log(")
            .replace(/10\^\(/g, "10**(");

        let result = eval(mathExpression);
        
        // ... ادامه کدهای شما (گردرکردن و نمایش نتیجه)
        result = Math.round(result * 100000000) / 100000000;
        
        let equationString = currentInput + " = " + result;
        
        historyList.push(equationString);
        if (historyList.length > 5) {
            historyList.shift();
        }
        
        historyDisplay.innerText = currentInput + " =";
        currentInput = result.toString();
        updateDisplay();
    } catch (error) {
        currentInput = "Error";
        updateDisplay();
        setTimeout(() => { clearAll(); }, 1500);
    }
}

// --- بخش کیبورد فیزیکی ---
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (/[0-9\+\-\.\(\)]/.test(key)) {
        appendValue(key);
    } else if (key === '*') {
        appendValue('×');
    } else if (key === '/') {
        appendValue('÷');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
    } else if (key === 'Backspace') {
        deleteChar();
    } else if (key === 'Escape') {
        clearAll();
    }
});

// --- بخش ارسال به دلتا چت (WebXDC) ---
function openShareModal() {
    document.getElementById('share-modal').style.display = 'flex';
}

function closeShareModal() {
    document.getElementById('share-modal').style.display = 'none';
}

function shareResult(type) {
    const historyText = document.getElementById('history').innerText;
    const resultText = document.getElementById('result').innerText;
    const textPayload = `\u200E${historyText} ${resultText}`;

    if (type === 'text') {
        if (window.webxdc && window.webxdc.sendToChat) {
            // متد استاندارد برای ارسال پیام به چت
            window.webxdc.sendToChat({
                text: textPayload
            });
        } else if (window.webxdc) {
            // نسخه پشتیبان برای ورژن‌های قدیمی دلتا چت
            window.webxdc.sendUpdate({
                payload: {},
                info: textPayload,
                summary: textPayload
            }, textPayload);
        } else {
            alert("This requires Delta Chat to send messages.");
        }
    } else if (type === 'image') {
        generateImageAndSend(historyText, resultText);
    }
    closeShareModal();
}

function generateImageAndSend(historyText, resultText) {
    const canvas = document.getElementById('render-canvas');
    const ctx = canvas.getContext('2d');
    
    // تنظیم پس‌زمینه
    ctx.fillStyle = '#1e222d'; 
    ctx.fillRect(0, 0, 400, 200);
    
    // تنظیم متن
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(historyText, 20, 60); 
    
    ctx.font = 'bold 36px Arial';
    ctx.fillText(resultText, 20, 130); 
    
    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1]; // استخراج بخش base64
    
    if (window.webxdc && window.webxdc.sendToChat) {
        // ارسال مستقیم فایل عکس به چت دلتا چت
        window.webxdc.sendToChat({
            file: {
                name: "calculation.png",
                base64: base64Data
            },
                    });
    } else if (window.webxdc) {
        // نسخه پشتیبان
        window.webxdc.sendUpdate({
            payload: {},
            info: "Calculation Image",
            document: {
                name: "calculation.png",
                base64: base64Data
            }
        }, "Image calculation sent.");
    } else {
        // اجرا در مرورگر معمولی (خارج از دلتا چت)
        let win = window.open();
        win.document.write(`<img src="${dataUrl}"/>`);
    }
}

