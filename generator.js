<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>房产数据生成器</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            padding: 10px;
            overflow: hidden;
        }
        .container {
            max-width: 1800px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 10px;
            height: 100%;
        }
        .panel {
            background: white;
            border-radius: 10px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            padding: 15px;
            overflow-y: auto;
        }
        h1 {
            color: #333;
            margin-bottom: 12px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        h2 {
            color: #333;
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 6px;
        }
        .form-section {
            margin-bottom: 12px;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
        }
        .form-group {
            margin-bottom: 8px;
        }
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        label {
            display: block;
            color: #555;
            margin-bottom: 4px;
            font-weight: 500;
            font-size: 12px;
        }
        input, select {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 13px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        .file-checkboxes {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-bottom: 10px;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px;
            background: #f8f9fa;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.2s;
            font-size: 11px;
        }
        .checkbox-item:hover {
            background: #e9ecef;
        }
        .checkbox-item input[type="checkbox"] {
            width: auto;
            cursor: pointer;
            margin: 0;
        }
        .checkbox-item label {
            margin: 0;
            cursor: pointer;
            font-size: 11px;
            font-weight: normal;
        }
        button {
            width: 100%;
            padding: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        .collapsible {
            margin-top: 10px;
        }
        .collapsible-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 8px;
            background: #f8f9fa;
            border-radius: 5px;
            cursor: pointer;
            user-select: none;
        }
        .collapsible-header:hover {
            background: #e9ecef;
        }
        .collapsible-title {
            font-weight: 600;
            font-size: 12px;
            color: #333;
        }
        .collapsible-icon {
            transition: transform 0.3s;
            font-size: 10px;
        }
        .collapsible-icon.open {
            transform: rotate(180deg);
        }
        .collapsible-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        .collapsible-content.open {
            max-height: 200px;
            overflow-y: auto;
            padding-top: 8px;
        }
        .progress-item {
            margin-bottom: 6px;
            padding: 6px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid #667eea;
            font-size: 11px;
        }
        .progress-item.completed {
            border-left-color: #4caf50;
            background: #e8f5e9;
        }
        .progress-item.processing {
            border-left-color: #ff9800;
            background: #fff3e0;
        }
        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }
        .progress-name {
            font-weight: 600;
            color: #333;
            font-size: 11px;
        }
        .progress-status {
            font-size: 10px;
            padding: 2px 5px;
            border-radius: 3px;
            background: #667eea;
            color: white;
        }
        .progress-item.completed .progress-status {
            background: #4caf50;
        }
        .progress-item.processing .progress-status {
            background: #ff9800;
        }
        .progress-bar {
            height: 3px;
            background: #e0e0e0;
            border-radius: 2px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s;
            width: 0%;
        }
        .files-list {
            margin-top: 10px;
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px;
            background: #f8f9fa;
            border-radius: 5px;
            margin-bottom: 6px;
            border: 1px solid #e0e0e0;
        }
        .file-info {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            min-width: 0;
        }
        .file-icon {
            width: 24px;
            height: 24px;
            background: #4caf50;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            flex-shrink: 0;
        }
        .file-name {
            font-weight: 500;
            color: #333;
            font-size: 11px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .file-actions {
            display: flex;
            gap: 4px;
            flex-shrink: 0;
        }
        .btn-small {
            padding: 4px 8px;
            font-size: 11px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }
        .btn-preview {
            background: #2196f3;
            color: white;
        }
        .btn-preview:hover {
            background: #1976d2;
        }
        .btn-download {
            background: #4caf50;
            color: white;
        }
        .btn-download:hover {
            background: #388e3c;
        }
        .preview-panel {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .preview-header {
            flex-shrink: 0;
            margin-bottom: 10px;
        }
        .preview-body {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .preview-content {
            display: none;
            flex: 1;
            overflow: auto;
        }
        .preview-content.active {
            display: flex;
            flex-direction: column;
        }
        .preview-tabs {
            display: flex;
            gap: 4px;
            margin-bottom: 8px;
            flex-wrap: wrap;
            flex-shrink: 0;
        }
        .preview-tab {
            padding: 5px 8px;
            background: #f0f0f0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s;
        }
        .preview-tab.active {
            background: #667eea;
            color: white;
        }
        .preview-table-container {
            flex: 1;
            overflow: auto;
            max-height: calc(100vh - 200px);
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .preview-table {
            width: auto;
            min-width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            background: white;
        }
        .preview-table th {
            background: #667eea;
            color: white;
            padding: 6px;
            text-align: left;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 10;
            font-size: 11px;
            white-space: nowrap;
            border-right: 1px solid rgba(255,255,255,0.2);
        }
        .preview-table td {
            padding: 5px 6px;
            border-bottom: 1px solid #e0e0e0;
            border-right: 1px solid #f0f0f0;
            white-space: nowrap;
        }
        .preview-table tr:hover {
            background: #f5f5f5;
        }
        .empty-state {
            text-align: center;
            padding: 30px;
            color: #999;
            font-size: 13px;
        }
        .debug-log {
            font-size: 10px;
            font-family: monospace;
            line-height: 1.3;
        }
        .debug-log div {
            margin-bottom: 2px;
        }
        .section-divider {
            border-top: 1px solid #e0e0e0;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="panel">
            <h1>🏢 房产数据生成器</h1>
            <form id="dataForm">
                <div class="form-section">
                    <div class="form-group full-width">
                        <label for="projectName">项目名称</label>
                        <input type="text" id="projectName" required placeholder="例如：桂城回迁" value="桂城回迁">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="plotCount">房屋数量</label>
                            <input type="number" id="plotCount" required min="1" value="5">
                        </div>
                        <div class="form-group">
                            <label for="houseTypeCount">户型数量</label>
                            <input type="number" id="houseTypeCount" required min="1" value="3">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="buildingCount">楼盘栋数</label>
                            <input type="number" id="buildingCount" required min="1" value="2">
                        </div>
                        <div class="form-group">
                            <label for="areaChangeCount">面积变动数量</label>
                            <input type="number" id="areaChangeCount" required min="1" value="5">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="collectionCount">采集表数量</label>
                            <input type="number" id="collectionCount" required min="1" value="10">
                        </div>
                        <div class="form-group">
                            <label for="collectionStartNum">宗地起始编号</label>
                            <input type="number" id="collectionStartNum" required min="1" value="1">
                        </div>
                    </div>
                </div>

                <div class="section-divider"></div>

                <div class="form-group">
                    <label>选择要生成的文件</label>
                    <div class="file-checkboxes">
                        <div class="checkbox-item">
                            <input type="checkbox" id="file1" value="签约台账" checked>
                            <label for="file1">签约台账</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="file2" value="一户一档" checked>
                            <label for="file2">一户一档</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="file3" value="户型信息" checked>
                            <label for="file3">户型信息</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="file4" value="房源" checked>
                            <label for="file4">房源</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="file5" value="回迁台账" checked>
                            <label for="file5">回迁台账</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="file6" value="面积变动" checked>
                            <label for="file6">面积变动</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="file7" value="采集表">
                            <label for="file7">采集表导入</label>
                        </div>
                    </div>
                </div>

                <button type="submit" id="generateBtn">生成Excel文件</button>
            </form>

            <div class="collapsible">
                <div class="collapsible-header" onclick="toggleCollapsible('debug')">
                    <span class="collapsible-title">📋 调试日志</span>
                    <span class="collapsible-icon" id="debug-icon">▼</span>
                </div>
                <div class="collapsible-content" id="debug-content">
                    <div class="debug-log" id="debugLog"></div>
                </div>
            </div>

            <div class="collapsible">
                <div class="collapsible-header" onclick="toggleCollapsible('progress')">
                    <span class="collapsible-title">⏳ 生成进度</span>
                    <span class="collapsible-icon" id="progress-icon">▼</span>
                </div>
                <div class="collapsible-content" id="progress-content">
                    <div id="progressList"></div>
                </div>
            </div>

            <div class="files-list" id="filesList" style="display: none;">
                <h2>已生成文件</h2>
                <div id="filesContainer"></div>
            </div>
        </div>

        <div class="panel preview-panel">
            <div class="preview-header">
                <h1>📊 数据预览</h1>
            </div>
            <div class="preview-body">
                <div id="previewContent">
                    <div class="empty-state">
                        <p>生成文件后，点击"预览"按钮查看数据</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="generator.js"></script>
</body>
</html>
