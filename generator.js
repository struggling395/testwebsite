const generatedFiles = [];
let currentPreviewFile = null;
let globalData = {}; // 存储全局数据供各表引用

function log(message) {
    const debugLog = document.getElementById('debugLog');
    const div = document.createElement('div');
    div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    debugLog.appendChild(div);
    debugLog.scrollTop = debugLog.scrollHeight;
    console.log(message);
}

function toggleCollapsible(id) {
    const content = document.getElementById(`${id}-content`);
    const icon = document.getElementById(`${id}-icon`);
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.classList.remove('open');
    } else {
        content.classList.add('open');
        icon.classList.add('open');
    }
}

window.addEventListener('load', () => {
    if (typeof XLSX !== 'undefined') {
        log('✓ XLSX库加载成功');
    } else {
        log('✗ XLSX库加载失败');
    }
});

document.getElementById('dataForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    log('表单提交开始');

    const projectName = document.getElementById('projectName').value;
    const plotCount = parseInt(document.getElementById('plotCount').value);
    const houseTypeCount = parseInt(document.getElementById('houseTypeCount').value);
    const buildingCount = parseInt(document.getElementById('buildingCount').value);
    const areaChangeCount = parseInt(document.getElementById('areaChangeCount').value);
    const collectionCount = parseInt(document.getElementById('collectionCount').value);
    const collectionStartNum = parseInt(document.getElementById('collectionStartNum').value);

    const selectedFiles = [];
    if (document.getElementById('file2').checked) selectedFiles.push('一户一档');
    if (document.getElementById('file3').checked) selectedFiles.push('户型信息');
    if (document.getElementById('file1').checked) selectedFiles.push('签约台账');
    if (document.getElementById('file5').checked) selectedFiles.push('回迁台账');
    if (document.getElementById('file6').checked) selectedFiles.push('面积变动');
    if (document.getElementById('file4').checked) selectedFiles.push('房源');
    if (document.getElementById('file7').checked) selectedFiles.push('采集表');

    if (selectedFiles.length === 0) {
        alert('请至少选择一个文件');
        return;
    }

    log(`参数: 项目=${projectName}, 房屋=${plotCount}, 户型=${houseTypeCount}, 楼栋=${buildingCount}, 面积变动=${areaChangeCount}, 采集表=${collectionCount}, 起始编号=${collectionStartNum}`);
    log(`选择文件: ${selectedFiles.join(', ')}`);

    document.getElementById('generateBtn').disabled = true;
    document.getElementById('progressList').innerHTML = '';
    document.getElementById('filesContainer').innerHTML = '';
    generatedFiles.length = 0;
    globalData = {};

    const progressContent = document.getElementById('progress-content');
    const progressIcon = document.getElementById('progress-icon');
    if (!progressContent.classList.contains('open')) {
        progressContent.classList.add('open');
        progressIcon.classList.add('open');
    }

    try {
        await generateAllFiles(projectName, plotCount, houseTypeCount, buildingCount, areaChangeCount, collectionCount, collectionStartNum, selectedFiles);
        log('✓ 所有文件生成完成');
    } catch (error) {
        log('✗ 生成失败: ' + error.message);
        console.error(error);
    }

    document.getElementById('generateBtn').disabled = false;
});

async function generateAllFiles(projectName, plotCount, houseTypeCount, buildingCount, areaChangeCount, collectionCount, collectionStartNum, selectedFiles) {
    initializeBaseData(projectName, plotCount, houseTypeCount, buildingCount, collectionStartNum);

    const fileGenerators = {
        '一户一档': { name: '一户一档数据上报.xlsx', generator: () => generateHouseArchive() },
        '户型信息': { name: '户型信息.xlsx', generator: () => generateHouseTypes() },
        '签约台账': { name: '签约台账.xlsx', generator: () => generateSignContract() },
        '回迁台账': { name: '回迁台账.xlsx', generator: () => generateRelocationLedger() },
        '面积变动': { name: '面积变动综合导入数据.xlsx', generator: () => generateAreaChange(areaChangeCount) },
        '房源': { name: `${projectName}房源.xlsx`, generator: () => generateHouseSources() },
        '采集表': { name: '采集表导入.xlsx', generator: () => generateCollectionTable(collectionCount, collectionStartNum) }
    };

    const filesToGenerate = selectedFiles.map(key => fileGenerators[key]);

    for (let i = 0; i < filesToGenerate.length; i++) {
        const file = filesToGenerate[i];
        log(`开始生成: ${file.name}`);

        addProgressItem(file.name, i);
        updateProgress(i, 'processing', 50);

        await sleep(300);

        try {
            const workbook = file.generator();
            log(`✓ ${file.name} 生成成功`);

            updateProgress(i, 'completed', 100);
            addGeneratedFile(file.name, workbook);
        } catch (error) {
            log(`✗ ${file.name} 生成失败: ${error.message}`);
            throw error;
        }

        await sleep(200);
    }

    document.getElementById('filesList').style.display = 'block';
}

function initializeBaseData(projectName, plotCount, houseTypeCount, buildingCount, startNum = 1) {
    const names = ['林永强', '罗瑞芳', '林雨桐', '郭晓彤', '陈建华', '王丽娟', '张明', '李芳', '赵强', '孙静'];
    const houseTypes = ['两房一厅', '三房一厅', '三房两厅', '四房两厅', '五房两厅', '复式'];
    const houseAreas = [68.9, 72.3, 86.7, 102.5, 125.8, 89.5];
    const phases = ['一期', '二期', '三期'];

    globalData.projectName = projectName;
    globalData.houses = [];
    globalData.houseTypes = [];
    globalData.buildings = [];

    // 生成户型数据
    for (let i = 0; i < houseTypeCount; i++) {
        globalData.houseTypes.push({
            name: houseTypes[i % houseTypes.length],
            area: houseAreas[i % houseAreas.length]
        });
    }

    // 生成楼栋和房源数据
    for (let b = 1; b <= buildingCount; b++) {
        const building = `${projectName}${b}栋`;
        const floors = Math.floor(Math.random() * 10) + 10;
        const unitsPerFloor = Math.floor(Math.random() * 2) + 2;

        for (let f = 1; f <= floors; f++) {
            for (let u = 1; u <= unitsPerFloor; u++) {
                const typeIdx = Math.floor(Math.random() * houseTypeCount);
                globalData.buildings.push({
                    building: building,
                    floor: f,
                    roomNo: `${f}${String(u).padStart(2, '0')}`,
                    houseType: globalData.houseTypes[typeIdx].name,
                    area: globalData.houseTypes[typeIdx].area
                });
            }
        }
    }

    // 生成房屋基础数据，编号从 startNum 开始
    for (let i = 0; i < plotCount; i++) {
        const num = startNum + i;
        const name = names[Math.floor(Math.random() * names.length)];
        const area = Math.floor(Math.random() * 200) + 60;
        const price = 9000;
        const total = area * price;
        const phase = phases[Math.floor(Math.random() * phases.length)];
        const assignedRoom = globalData.buildings[Math.floor(Math.random() * globalData.buildings.length)];

        globalData.houses.push({
            houseCode: `ZD${String(num).padStart(3, '0')}`,
            agreementCode: `XYZD${String(num).padStart(3, '0')}`,
            name: name,
            idCard: `4406051${Math.floor(Math.random() * 1000000000)}`,
            phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            area: area,
            price: price,
            total: total,
            address: `佛山市南海区桂城街道约西嘉东约${Math.floor(Math.random() * 100) + 1}号`,
            signDate: randomDate(2026, 1, 4),
            deliveryDate: randomDate(2025, 1, 2026, 12),
            phase: phase,
            assignedBuilding: assignedRoom.building,
            assignedRoom: assignedRoom.roomNo
        });
    }
}

function addProgressItem(name, index) {
    const progressList = document.getElementById('progressList');
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.id = `progress-${index}`;
    item.innerHTML = `
        <div class="progress-header">
            <span class="progress-name">${name}</span>
            <span class="progress-status">等待中</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    `;
    progressList.appendChild(item);
}

function updateProgress(index, status, percent) {
    const item = document.getElementById(`progress-${index}`);
    const statusText = status === 'processing' ? '生成中' : status === 'completed' ? '已完成' : '等待中';
    item.className = `progress-item ${status}`;
    item.querySelector('.progress-status').textContent = statusText;
    item.querySelector('.progress-fill').style.width = `${percent}%`;
}

function addGeneratedFile(name, workbook) {
    generatedFiles.push({ name, workbook });
    const container = document.getElementById('filesContainer');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-icon">📄</div>
            <span class="file-name">${name}</span>
        </div>
        <div class="file-actions">
            <button class="btn-small btn-preview" onclick="previewFile('${name}')">预览</button>
            <button class="btn-small btn-download" onclick="downloadFile('${name}')">下载</button>
        </div>
    `;
    container.appendChild(fileItem);
}

function previewFile(fileName) {
    log(`预览文件: ${fileName}`);
    const file = generatedFiles.find(f => f.name === fileName);
    if (!file) {
        log('✗ 文件不存在');
        return;
    }

    currentPreviewFile = file;
    const previewContent = document.getElementById('previewContent');
    const sheets = file.workbook.SheetNames;
    let html = `<h2 style="margin-bottom: 15px; font-size: 16px;">${fileName}</h2>`;

    if (sheets.length > 1) {
        html += '<div class="preview-tabs">';
        sheets.forEach((sheet, idx) => {
            html += `<button class="preview-tab ${idx === 0 ? 'active' : ''}" onclick="switchSheet(${idx})">${sheet}</button>`;
        });
        html += '</div>';
    }

    sheets.forEach((sheetName, idx) => {
        const worksheet = file.workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        html += `<div class="preview-content ${idx === 0 ? 'active' : ''}" id="sheet-${idx}">`;

        if (data.length > 0) {
            html += '<div class="preview-table-container"><table class="preview-table">';

            // 对于采集表，前3行都是表头
            const isCollectionTable = fileName.includes('采集表');
            const headerRows = isCollectionTable ? 3 : 1;

            html += '<thead>';
            for (let i = 0; i < headerRows && i < data.length; i++) {
                html += '<tr>';
                data[i].forEach(cell => {
                    html += `<th>${cell || ''}</th>`;
                });
                html += '</tr>';
            }
            html += '</thead>';

            html += '<tbody>';
            const maxRows = Math.min(data.length, headerRows + 50);
            for (let i = headerRows; i < maxRows; i++) {
                html += '<tr>';
                data[i].forEach(cell => {
                    html += `<td>${cell !== undefined && cell !== null ? cell : ''}</td>`;
                });
                html += '</tr>';
            }
            html += '</tbody></table></div>';
            if (data.length > headerRows + 50) {
                html += `<p style="text-align: center; padding: 10px; color: #999; font-size: 12px;">仅显示前50行数据，共${data.length - headerRows}行</p>`;
            }
        } else {
            html += '<p class="empty-state">无数据</p>';
        }
        html += '</div>';
    });

    previewContent.innerHTML = html;
    log(`✓ 预览加载完成，共${sheets.length}个Sheet`);
}

function switchSheet(index) {
    document.querySelectorAll('.preview-tab').forEach((tab, idx) => {
        tab.classList.toggle('active', idx === index);
    });
    document.querySelectorAll('.preview-content').forEach((content, idx) => {
        content.classList.toggle('active', idx === index);
    });
}

function downloadFile(fileName) {
    log(`下载文件: ${fileName}`);
    const file = generatedFiles.find(f => f.name === fileName);
    if (!file) {
        log('✗ 文件不存在');
        return;
    }
    try {
        XLSX.writeFile(file.workbook, fileName);
        log(`✓ ${fileName} 下载成功`);
    } catch (error) {
        log(`✗ 下载失败: ${error.message}`);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDate(startYear, startMonth, endYear, endMonth) {
    if (arguments.length === 2) {
        endYear = startYear;
        endMonth = startMonth;
    } else if (arguments.length === 3) {
        endMonth = startMonth + endYear - 1;
        endYear = startYear;
    }
    const start = new Date(startYear, startMonth - 1, 1);
    const end = new Date(endYear, endMonth - 1, 28);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function generateSignContract() {
    const data = globalData.houses.map(house => ({
        '协议编号': house.agreementCode, '房屋编号': house.houseCode, '安置面积': house.area,
        '回迁车位数': 0, '手机号码': house.phone, '被安置人': house.name, '证件号码': house.idCard,
        '签约时间': house.signDate, '交屋时间': house.deliveryDate, '住宅补偿金额': house.total,
        '商铺补偿金额': 0, '车位补偿金额': 0, '总补偿金额': house.total, '补偿标准（元/㎡）': house.price
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return wb;
}

function generateHouseArchive() {
    const wb = XLSX.utils.book_new();
    const names = ['张强', '李明', '王婷', '刘芳', '陈伟'];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(globalData.houses.map(h => ({
        '房屋编号': h.houseCode, '房屋地址': h.address, '建筑面积': h.area,
        '是否09年建成': Math.random() > 0.5 ? '是' : '否', '搬迁状态': '已搬迁', '拆卸状态': '已拆卸'
    }))), '房屋信息');

    const measureDetail = [];
    globalData.houses.forEach(h => {
        const cert = Math.floor(h.area * 0.85);
        measureDetail.push(
            { '房屋编号': h.houseCode, '明细名称': '实测总建筑面积', '数量': h.area, '单位': '平方米' },
            { '房屋编号': h.houseCode, '明细名称': '有证建筑面积合计', '数量': cert, '单位': '平方米' },
            { '房屋编号': h.houseCode, '明细名称': '无证建筑面积合计', '数量': h.area - cert, '单位': '平方米' }
        );
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(measureDetail), '测量明细');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(globalData.houses.map((h, i) => ({
        '房屋编号': h.houseCode, '评估报告编号': `PGZD${String(i+1).padStart(3,'0')}`,
        '评估报告名称': '约西嘉东ZD030号房屋评估报告'
    }))), '评估报告');

    const apprDetail = [];
    globalData.houses.forEach((h, i) => {
        const pg = `PGZD${String(i+1).padStart(3,'0')}`;
        const base = Math.floor(h.total * 0.9);
        apprDetail.push(
            { '房屋编号': h.houseCode, '评估报告编号': pg, '明细名称': '房地产价值评估总价值', '数量': base, '单位': '元' },
            { '房屋编号': h.houseCode, '评估报告编号': pg, '明细名称': '装修补偿评估总价值', '数量': Math.floor(base*0.08), '单位': '元' },
            { '房屋编号': h.houseCode, '评估报告编号': pg, '明细名称': '附属物补偿评估总价值', '数量': Math.floor(base*0.02), '单位': '元' }
        );
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(apprDetail), '评估报告明细');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(globalData.houses.map(h => {
        const members = Array(Math.floor(Math.random()*3)+2).fill(0).map(() => names[Math.floor(Math.random()*names.length)]);
        const memberIds = members.map(() => `4406052${Math.floor(Math.random()*1000000000)}`);
        return {
            '房屋编号': h.houseCode, '户口编号': `HKZD${h.houseCode.substring(2)}`, '户口地址': h.address,
            '户主名称': h.name, '户主证件号': h.idCard, '户口成员': members.join(';'), '户口成员证件号': memberIds.join(';')
        };
    })), '户口信息');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(globalData.houses.map((h, i) => ({
        '房屋编号': h.houseCode, '产权证号': `房地产权证桂字第${String(i+1).padStart(3,'0')}号`,
        '证载地址': h.address, '产权人': h.name, '产权人证件号码': h.idCard,
        '证载建筑面积': Math.floor(h.area*0.9), '证载建基面积': Math.floor(h.area*0.6)
    }))), '产权信息');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(globalData.houses.map(h => ({
        '房屋编号': h.houseCode, '协议编号': h.agreementCode, '签约时间': h.signDate,
        '补偿人': h.name, '补偿人证件号码': h.idCard, '安置补偿面积': h.area,
        '补偿金额': h.total, '附属物金额': Math.floor(h.total*0.02), '已支付': h.total
    }))), '协议');

    const compDetail = [];
    globalData.houses.forEach(h => {
        const base = Math.floor(h.total * 0.9);
        compDetail.push(
            { '房屋编号': h.houseCode, '协议编号': h.agreementCode, '明细名称': '房地产价值款', '数量': base, '单位': '元', '总额': base, '已付': base },
            { '房屋编号': h.houseCode, '协议编号': h.agreementCode, '明细名称': '装修补偿', '数量': Math.floor(base*0.08), '单位': '元', '总额': Math.floor(base*0.08), '已付': Math.floor(base*0.08) },
            { '房屋编号': h.houseCode, '协议编号': h.agreementCode, '明细名称': '附属物补偿', '数量': Math.floor(base*0.02), '单位': '元', '总额': Math.floor(base*0.02), '已付': Math.floor(base*0.02) }
        );
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(compDetail), '补偿明细');

    const finance = [];
    const banks = ['ABC', 'ICBC', 'BOC', 'CCB', 'CMB'];
    const payMethods = ['现金支付', '银行转账', '支票支付'];
    globalData.houses.forEach(h => {
        const base = Math.floor(h.total * 0.9);
        // 第1批：前6项费用的总和
        const batch1Amount = Math.floor(base * (0.9 + 0.07 + 0.02 + 0.02 + 0.004 + 0.003));
        // 第2批：后2项费用的总和
        const batch2Amount = Math.floor(base * (0.01 + 0.013));

        finance.push({
            '房屋编号': h.houseCode, '支付批次': '第1批', '已支付金额': batch1Amount,
            '支付日期': randomDate(2025,7,2026,3), '支付方式': payMethods[Math.floor(Math.random()*payMethods.length)],
            '银行流水号': `${banks[Math.floor(Math.random()*banks.length)]}${randomDate(2025,1,2026,12).replace(/-/g,'')}${Math.floor(Math.random()*10000)}`,
            '收款人': h.name, '收款人账户': `6${Math.floor(Math.random()*1000000000000000)}`, '对应协议编号': h.agreementCode
        });

        finance.push({
            '房屋编号': h.houseCode, '支付批次': '第2批', '已支付金额': batch2Amount,
            '支付日期': randomDate(2025,7,2026,3), '支付方式': payMethods[Math.floor(Math.random()*payMethods.length)],
            '银行流水号': `${banks[Math.floor(Math.random()*banks.length)]}${randomDate(2025,1,2026,12).replace(/-/g,'')}${Math.floor(Math.random()*10000)}`,
            '收款人': h.name, '收款人账户': `6${Math.floor(Math.random()*1000000000000000)}`, '对应协议编号': h.agreementCode
        });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(finance), '财务信息');

    const payDetail = [];
    const feeNames = ['房地产价值款','装修补偿','附属物补偿','搬迁奖励','临时安置补助费','安签奖励','签约奖励','搬迁费'];
    globalData.houses.forEach(h => {
        const base = Math.floor(h.total * 0.9);
        [0.9, 0.07, 0.02, 0.02, 0.004, 0.003, 0.01, 0.013].forEach((rate, idx) => {
            payDetail.push({
                '房屋编号': h.houseCode, '支付批次': idx<6?'第1期':'第2期',
                '费项名称': feeNames[idx], '已支付金额': Math.floor(base*rate)
            });
        });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payDetail), '支付明细');
    return wb;
}

function generateHouseTypes() {
    const ws = XLSX.utils.json_to_sheet(globalData.houseTypes.map(t => ({
        '户型名称': t.name, '户型面积': t.area, '备注': '桂城回迁户型'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '回迁户型导入模板');
    return wb;
}

function generateHouseSources() {
    const ws = XLSX.utils.json_to_sheet(globalData.buildings.map(r => ({
        '楼栋号': r.building, '地址': `佛山市南海区桂城街道${r.building}`,
        '层号': r.floor, '户号': r.roomNo, '户型': r.houseType, '房屋类型': '住宅', '建筑面积': r.area
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '桂城房源');
    return wb;
}

function generateRelocationLedger() {
    const ws = XLSX.utils.json_to_sheet(globalData.houses.map(h => ({
        '协议编号': h.agreementCode, '房屋编号': h.houseCode, '被安置人姓名': h.name,
        '证件号码': h.idCard, '手机号码': h.phone, '住宅安置面积(㎡)': h.area, '车位数': 0,
        '补偿标准(元/㎡)': h.price, '总补偿金额(元)': h.total, '所属分期名称': h.phase,
        '安置房宗地号': h.assignedBuilding, '安置房号': h.assignedRoom, '交房时间': h.deliveryDate
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '回迁台账综合导入模板');
    return wb;
}

function generateAreaChange(count) {
    const types = ['流转', '申购', '弃产'];
    const data = [];
    for (let i = 0; i < count && i < globalData.houses.length; i++) {
        const h = globalData.houses[i];
        const type = types[i % types.length];
        const area = Math.floor(Math.random() * 30) + 5;
        const target = globalData.houses[(i + 1) % globalData.houses.length];
        let amount = null, contractNo = null, remark = '';
        if (type === '流转') {
            contractNo = `LZ-HT-2025-${String(i+1).padStart(3,'0')}`;
            remark = `${h.name}流转${area}㎡给${target.name}`;
        } else if (type === '申购') {
            amount = area * 10000;
            contractNo = `SG-HT-2025-${String(i+1).padStart(3,'0')}`;
            remark = `${h.name}申购${area}㎡`;
        } else {
            remark = `${h.name}弃产${area}㎡`;
        }
        data.push({
            '类型': type, '协议编号': h.agreementCode, '被安置人姓名': h.name, '证件号码': h.idCard,
            '面积(㎡)': area, '对方协议编号': target.agreementCode, '安置房宗地号': h.assignedBuilding,
            '安置房号': h.assignedRoom, '合同号': contractNo||'', '业务时间': randomDate(2025,7,2026,6),
            '金额(元)': amount||'', '备注': remark
        });
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '面积变动综合导入模板');
    return wb;
}

function generateCollectionTable(count, startNum) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    // 第1行：大标题
    XLSX.utils.sheet_add_aoa(ws, [['宗地信息', '', '', '', '', '补偿人信息', '', '', '', '产权证信息', '', '', '', '', '测绘信息', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '评估信息']], {origin: 'A1'});

    // 第2行：子标题
    XLSX.utils.sheet_add_aoa(ws, [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '住宅', '', '', '', '', '', '', '非住宅', '', '', '', '征地', '', '', '', '', '', '青苗', '基本信息', '', '', '评估价值合计', '住宅', '', '', '', '', '', '非住宅', '', '', '', '', '', '', '', '', '', '', '', '', '征地', '', '', '', '青苗', '', '']], {origin: 'A2'});

    // 第3行：字段名
    const headers = [
        '房屋编号', '社别', '所属社区', '房屋地址', '土地性质',
        '补偿人名称', '补偿人电话', '补偿人地址', '补偿人证件号码',
        '土地产权证件号', '土地权属人', '权属人证件号码', '证载建基面积(㎡)', '证载总建筑面积(㎡)',
        '实测建基面积', '实测总建筑面积', '符合管理规定的建筑面积', '房屋超规面积', '历史用地面积', '历史房屋面积', '无证房屋面积',
        '无证建筑物面积', '有证建筑物面积', '构筑物面积', '征收面积',
        '农用地（包括未利用地）面积', '有证建设用地面积', '无证建设用地面积', '留用地指标面积', '填土或平整的土地面积', '征地总面积', '青苗补偿面积',
        '评估报告名称', '评估报告编号', '类型', '评估价值合计',
        '房屋价值补偿评估值', '无证房屋补偿评估值', '房屋装修补偿评估值', '附属物补偿评估值', '树木补偿评估值', '房屋附属设施搬迁补偿评估值',
        '有证建筑物补偿评估值', '无证建筑物补偿评估值', '构筑物补偿评估值', '装修补偿评估值', '附属物补偿评估值', '树木补偿评估值',
        '原材料、半成品、成品、一般性设备评估值', '生产线设备和特殊设备评估值', '停产停业损失补偿评估值', '工人安置费用补偿评估值',
        '临时安置补偿评估值', '租金补偿评估值', '搬迁补助',
        '有证建设用地的补偿评估值', '无证事实建设用地的补偿评估值', '国有出让土地补偿评估值', '填土补偿评估值',
        '高值塘鱼、花卉、果树等及有争议的青苗补偿评估值', '农用地上生产设施、附属设施施以及配套设施补偿评估值', '可搬迁再利用的设施补偿评估值'
    ];
    XLSX.utils.sheet_add_aoa(ws, [headers], {origin: 'A3'});

    // 生成数据
    const names = ['秦欣', '梁桂英', '陈见夏', '陈见秋', '张明', '李芳', '王强', '刘静', '赵伟', '孙丽'];
    const communities = ['社区A', '社区B', '社区C'];
    const data = [];

    for (let i = 0; i < count; i++) {
        const num = startNum + i;
        const houseCode = `ZD${String(num).padStart(2, '0')}`;
        const name = names[Math.floor(Math.random() * names.length)];
        const community = communities[Math.floor(Math.random() * communities.length)];

        const baseArea = Math.floor(Math.random() * 100) + 50;
        const totalArea = Math.floor(baseArea * (1.5 + Math.random() * 0.5));
        const certifiedArea = Math.floor(totalArea * 0.8);
        const uncertifiedArea = totalArea - certifiedArea;

        const baseValue = Math.floor(Math.random() * 10000) + 5000;

        data.push([
            houseCode, community, community,
            `佛山市测试F项目地址${String(num).padStart(2, '0')}`, '住宅',
            name, `134501${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
            `佛山市平南街道${String(num).padStart(2, '0')}号`,
            `45221655${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
            `粤第${String(num).padStart(4, '0')}号`, name,
            `45221655${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
            baseArea, totalArea,
            baseArea, totalArea, certifiedArea, Math.floor(totalArea * 0.2),
            Math.floor(baseArea * 0.2), Math.floor(totalArea * 0.7), Math.floor(totalArea * 0.1),
            uncertifiedArea, certifiedArea, Math.floor(totalArea * 1.2), Math.floor(baseArea * 0.6),
            Math.floor(baseArea * 1.2), Math.floor(baseArea * 0.6), Math.floor(baseArea * 1.2),
            Math.floor(baseArea * 0.9), Math.floor(baseArea * 0.5), Math.floor(baseArea * 1.2), Math.floor(baseArea * 1.5),
            `${houseCode}的评估报告`, `PGBGBH${String(num).padStart(2, '0')}`, '住宅', baseValue,
            baseValue, Math.floor(baseValue * 0.25), Math.floor(baseValue * 4.2), Math.floor(baseValue * 0.12), Math.floor(baseValue * 0.2),
            Math.floor(baseValue * 4.2), Math.floor(baseValue * 0.4), Math.floor(baseValue * 0.25), Math.floor(baseValue * 4.2),
            Math.floor(baseValue * 4.2), Math.floor(baseValue * 10), Math.floor(baseValue * 43),
            Math.floor(baseValue), Math.floor(baseValue * 0.25), Math.floor(baseValue * 4.2), Math.floor(baseValue * 0.12),
            Math.floor(baseValue * 0.2), Math.floor(baseValue * 4.2), Math.floor(baseValue * 0.4),
            Math.floor(baseValue * 0.25), Math.floor(baseValue * 4.2), Math.floor(baseValue * 20), Math.floor(baseValue * 10),
            Math.floor(baseValue * 43), Math.floor(baseValue * 20), Math.floor(baseValue * 10)
        ]);
    }

    XLSX.utils.sheet_add_aoa(ws, data, {origin: 'A4'});

    // 设置列宽
    const colWidths = headers.map(() => ({wch: 15}));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return wb;
}
