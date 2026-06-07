/**
 * 慧学习 WiseLearn - 交互式知识学习应用服务器
 * 提供文件解析、URL解析等API接口
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 文件解析库
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const officeparser = require('officeparser');
const marked = require('marked');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 文件上传配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 保留原始文件名，添加时间戳避免冲突
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB限制
        files: 10 // 最多10个文件
    },
    fileFilter: function (req, file, cb) {
        const supportedTypes = ['.pdf', '.docx', '.pptx', '.md', '.markdown'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (supportedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`不支持的文件格式: ${ext}`));
        }
    }
});

/**
 * 文件解析API
 * POST /api/parse-file
 * 接收上传的文件，解析内容并返回文本
 */
app.post('/api/parse-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }
        
        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        
        let content = '';
        
        // 根据文件类型选择解析方法
        switch (ext) {
            case '.pdf':
                content = await parsePDF(filePath);
                break;
            case '.docx':
                content = await parseWord(filePath);
                break;
            case '.pptx':
                content = await parsePPT(filePath);
                break;
            case '.md':
            case '.markdown':
                content = await parseMarkdown(filePath);
                break;
            default:
                throw new Error(`不支持的文件格式: ${ext}`);
        }
        
        // 清理上传的文件
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            filename: req.file.originalname,
            content: content
        });
        
    } catch (error) {
        console.error('文件解析错误:', error);
        
        // 清理可能存在的临时文件
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * URL解析API
 * POST /api/parse-url
 * 接收网页URL，抓取内容并解析
 */
app.post('/api/parse-url', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: '请提供URL' });
        }
        
        const content = await parseURL(url);
        
        res.json({
            success: true,
            url: url,
            content: content
        });
        
    } catch (error) {
        console.error('URL解析错误:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 批量文件解析API
 * POST /api/parse-files
 * 接收多个文件，解析所有文件内容
 */
app.post('/api/parse-files', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '没有上传文件' });
        }
        
        const results = [];
        
        for (const file of req.files) {
            try {
                const ext = path.extname(file.originalname).toLowerCase();
                let content = '';
                
                switch (ext) {
                    case '.pdf':
                        content = await parsePDF(file.path);
                        break;
                    case '.docx':
                        content = await parseWord(file.path);
                        break;
                    case '.pptx':
                        content = await parsePPT(file.path);
                        break;
                    case '.md':
                    case '.markdown':
                        content = await parseMarkdown(file.path);
                        break;
                    default:
                        throw new Error(`不支持的文件格式: ${ext}`);
                }
                
                results.push({
                    filename: file.originalname,
                    content: content,
                    success: true
                });
                
            } catch (error) {
                results.push({
                    filename: file.originalname,
                    error: error.message,
                    success: false
                });
            } finally {
                // 清理临时文件
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
        
        res.json({
            success: true,
            results: results
        });
        
    } catch (error) {
        console.error('批量文件解析错误:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 解析PDF文件
 * @param {string} filePath PDF文件路径
 * @returns {Promise<string>} 解析后的文本内容
 */
async function parsePDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text || '';
    } catch (error) {
        console.error('PDF解析错误:', error);
        throw new Error(`PDF解析失败: ${error.message}`);
    }
}

/**
 * 解析Word文档（.docx）
 * @param {string} filePath Word文件路径
 * @returns {Promise<string>} 解析后的文本内容
 */
async function parseWord(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || '';
    } catch (error) {
        console.error('Word解析错误:', error);
        throw new Error(`Word文档解析失败: ${error.message}`);
    }
}

/**
 * 解析PowerPoint演示文稿（.pptx）
 * @param {string} filePath PPT文件路径
 * @returns {Promise<string>} 解析后的文本内容
 */
async function parsePPT(filePath) {
    try {
        const text = await officeparser.parseOfficeAsync(filePath);
        return text || '';
    } catch (error) {
        console.error('PPT解析错误:', error);
        throw new Error(`PPT解析失败: ${error.message}`);
    }
}

/**
 * 解析Markdown文件
 * @param {string} filePath Markdown文件路径
 * @returns {Promise<string>} 解析后的文本内容
 */
async function parseMarkdown(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // 将Markdown转换为纯文本（去除HTML标签）
        const html = marked.parse(content);
        // 简单去除HTML标签，保留文本内容
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error('Markdown解析错误:', error);
        throw new Error(`Markdown解析失败: ${error.message}`);
    }
}

/**
 * 解析网页URL
 * @param {string} url 网页URL
 * @returns {Promise<string>} 解析后的文本内容
 */
async function parseURL(url) {
    try {
        // 设置请求头，模拟浏览器访问
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        // 移除脚本和样式
        $('script, style, noscript, iframe').remove();
        
        // 提取标题
        const title = $('title').text().trim();
        
        // 提取主要文本内容
        let content = '';
        
        // 优先提取文章主体内容
        const mainContent = $('article, main, .content, .article, .post, .entry-content').first();
        if (mainContent.length > 0) {
            content = mainContent.text().trim();
        } else {
            // 如果没有找到主体内容，提取body的文本
            content = $('body').text().trim();
        }
        
        // 清理文本：移除多余空白字符
        content = content.replace(/\s+/g, ' ').trim();
        
        // 如果有标题，添加到内容开头
        if (title) {
            content = `标题：${title}\n\n${content}`;
        }
        
        // 限制内容长度（避免过长）
        if (content.length > 50000) {
            content = content.substring(0, 50000) + '...';
        }
        
        return content;
        
    } catch (error) {
        console.error('URL解析错误:', error);
        throw new Error(`网页解析失败: ${error.message}`);
    }
}

/**
 * 健康检查API
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: '慧学习 WiseLearn API'
    });
});

/**
 * 获取支持的文件格式
 * GET /api/formats
 */
app.get('/api/formats', (req, res) => {
    res.json({
        supportedFormats: [
            { ext: '.pdf', name: 'PDF文档', mime: 'application/pdf' },
            { ext: '.docx', name: 'Word文档', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { ext: '.pptx', name: 'PowerPoint演示文稿', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
            { ext: '.md', name: 'Markdown文档', mime: 'text/markdown' },
            { ext: '.markdown', name: 'Markdown文档', mime: 'text/markdown' }
        ],
        maxFiles: 10,
        maxFileSize: '50MB'
    });
});

/**
 * LLM API代理
 * POST /api/chat
 * 转发前端请求到Qwen大模型API，避免CORS问题
 */
const LLM_API_KEY = '7d69850def6af33bee24906bdf4535ea';
const LLM_API_URL = 'http://223.109.239.32:17215/v1';

app.post('/api/chat', async (req, res) => {
    try {
        const { model, messages, temperature, max_tokens } = req.body;
        
        const response = await axios.post(`${LLM_API_URL}/chat/completions`, {
            model: model || 'Qwen3.6-27B',
            messages: messages || [],
            temperature: temperature || 0.7,
            max_tokens: max_tokens || 2000
        }, {
            headers: {
                'Authorization': `Bearer ${LLM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60秒超时
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('LLM API错误:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'AI服务调用失败: ' + (error.response?.data?.error?.message || error.message)
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: '文件大小超过限制（最大50MB）'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: '文件数量超过限制（最多10个）'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: err.message || '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`\n慧学习 WiseLearn 服务器已启动`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log(`API接口: http://localhost:${PORT}/api`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
    console.log(`\n按 Ctrl+C 停止服务器\n`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});
