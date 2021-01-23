import default_theme from "./themes/default-theme";
import prettier from "prettier/standalone";
import prettierMarkdown from "prettier/parser-markdown";
import prettierCss from "prettier/parser-postcss";

// 设置自定义颜色
export function setColorWithTemplate(template) {
    return function (color) {
        let custom_theme = JSON.parse(JSON.stringify(template));
        custom_theme.block.h1["border-bottom"] = `2px solid ${color}`;
        custom_theme.block.h2["background"] = color;
        custom_theme.block.h3["border-left"] = `3px solid ${color}`;
        custom_theme.block.h4["color"] = color;
        custom_theme.inline.strong["color"] = color;
        return custom_theme;
    };
}

export const setColorWithCustomTemplate = function setColorWithCustomTemplate(
    template,
    color
) {
    let custom_theme = JSON.parse(JSON.stringify(template));
    custom_theme.block.h1["border-bottom"] = `2px solid ${color}`;
    custom_theme.block.h2["background"] = color;
    custom_theme.block.h3["border-left"] = `3px solid ${color}`;
    custom_theme.block.h4["color"] = color;
    custom_theme.inline.strong["color"] = color;
    return custom_theme;
};

// 设置自定义字体大小
export function setFontSizeWithTemplate(template) {
    return function (fontSize) {
        let custom_theme = JSON.parse(JSON.stringify(template));
        custom_theme.block.h1["font-size"] = `${fontSize * 1.14}px`;
        custom_theme.block.h2["font-size"] = `${fontSize * 1.1}px`;
        custom_theme.block.h3["font-size"] = `${fontSize}px`;
        custom_theme.block.h4["font-size"] = `${fontSize}px`;
        return custom_theme;
    };
}

export const setColor = setColorWithTemplate(default_theme);
export const setFontSize = setFontSizeWithTemplate(default_theme);

export function customCssWithTemplate(jsonString, color, theme) {
    let custom_theme = JSON.parse(JSON.stringify(theme));
    // block
    custom_theme.block.h1["border-bottom"] = `2px solid ${color}`;
    custom_theme.block.h2["background"] = color;
    custom_theme.block.h3["border-left"] = `3px solid ${color}`;
    custom_theme.block.h4["color"] = color;
    custom_theme.inline.strong["color"] = color;

    custom_theme.block.h1 = Object.assign(custom_theme.block.h1, jsonString.h1);
    custom_theme.block.h2 = Object.assign(custom_theme.block.h2, jsonString.h2);
    custom_theme.block.h3 = Object.assign(custom_theme.block.h3, jsonString.h3);
    custom_theme.block.h4 = Object.assign(custom_theme.block.h4, jsonString.h4);
    custom_theme.block.p = Object.assign(custom_theme.block.p, jsonString.p);
    custom_theme.block.blockquote = Object.assign(
        custom_theme.block.blockquote,
        jsonString.blockquote
    );
    custom_theme.block.blockquote_p = Object.assign(
        custom_theme.block.blockquote_p,
        jsonString.blockquote_p
    );
    custom_theme.block.image = Object.assign(
        custom_theme.block.image,
        jsonString.image
    );

    // inline
    custom_theme.inline.strong = Object.assign(
        custom_theme.inline.strong,
        jsonString.strong
    );
    custom_theme.inline.codespan = Object.assign(
        custom_theme.inline.codespan,
        jsonString.codespan
    );
    custom_theme.inline.link = Object.assign(
        custom_theme.inline.link,
        jsonString.link
    );
    custom_theme.inline.wx_link = Object.assign(
        custom_theme.inline.wx_link,
        jsonString.wx_link
    );

    return custom_theme;
}

/**
 * 将CSS形式的字符串转换为JSON
 *
 * @param {css字符串} css
 */
export function css2json(css) {
    // 移除CSS所有注释
    let open, close;
    while (
        (open = css.indexOf("/*")) !== -1 &&
        (close = css.indexOf("*/")) !== -1
    ) {
        css = css.substring(0, open) + css.substring(close + 2);
    }

    // 初始化返回值
    let json = {};

    while (
        css.length > 0 &&
        css.indexOf("{") !== -1 &&
        css.indexOf("}") !== -1
    ) {
        // 存储第一个左/右花括号的下标
        const lbracket = css.indexOf("{");
        const rbracket = css.indexOf("}");

        // 第一步：将声明转换为Object，如：
        // `font: 'Times New Roman' 1em; color: #ff0000; margin-top: 1em;`
        //  ==>
        // `{"font": "'Times New Roman' 1em", "color": "#ff0000", "margin-top": "1em"}`

        // 辅助方法：将array转为object
        function toObject(array) {
            let ret = {};
            array.forEach((e) => {
                const index = e.indexOf(":");
                const property = e.substring(0, index).trim();
                const value = e.substring(index + 1).trim();
                ret[property] = value;
            });
            return ret;
        }

        // 切割声明块并移除空白符，然后放入数组中
        let declarations = css
            .substring(lbracket + 1, rbracket)
            .split(";")
            .map((e) => e.trim())
            .filter((e) => e.length > 0); // 移除所有""空值

        // 转为Object对象
        declarations = toObject(declarations);

        // 第二步：选择器处理，每个选择器会与它对应的声明相关联，如：
        // `h1, p#bar {color: red}`
        // ==>
        // {"h1": {color: red}, "p#bar": {color: red}}

        let selectors = css
            .substring(0, lbracket)
            // 以,切割，并移除空格：`"h1, p#bar, span.foo"` => ["h1", "p#bar", "span.foo"]
            .split(",")
            .map((selector) => selector.trim());

        // 迭代赋值
        selectors.forEach((selector) => {
            // 若不存在，则先初始化
            if (!json[selector]) json[selector] = {};
            // 赋值到JSON
            Object.keys(declarations).forEach((key) => {
                json[selector][key] = declarations[key];
            });
        });

        // 继续下个声明块
        css = css.slice(rbracket + 1).trim();
    }

    // 返回JSON形式的结果串
    return json;
}

/**
 * 将编辑器内容保存到 LocalStorage
 * @param {*} editor
 * @param {*} name
 */
export function saveEditorContent(editor, name) {
    const content = editor.getValue(0);
    if (content) {
        localStorage.setItem(name, content);
    } else {
        localStorage.removeItem(name);
    }
}

/**
 * 格式化文档
 * @param {文档内容} content
 */
export function formatDoc(content) {
    const doc = prettier.format(content, {
        parser: "markdown",
        plugins: [prettierMarkdown],
    });
    return doc;
}

/**
 * 格式化css
 * @param {css内容}} content
 */
export function formatCss(content) {
    const doc = prettier.format(content, {
        parser: "css",
        plugins: [prettierCss],
    });
    return doc;
}

export function fixCodeWhiteSpace(value = "pre") {
    const preDomList = document.getElementsByClassName("code__pre");
    if (preDomList.length > 0) {
        preDomList.forEach((pre) => {
            pre.style.whiteSpace = value;
        });
    }
}

/**
 * 下载原始 Markdown 文档
 * @param {文档内容} doc
 */
export function downloadMD(doc) {
    let downLink = document.createElement("a");

    downLink.download = "content.md";
    downLink.style.display = "none";
    let blob = new Blob([doc]);

    downLink.href = URL.createObjectURL(blob);
    document.body.appendChild(downLink);
    downLink.click();
    document.body.removeChild(downLink);
}

/**
 * 生成列表字符串
 * @param {*} data 对应内容集合
 * @param {*} rows 行
 * @param {*} cols 列
 */
export function createTable({ data, rows, cols }) {
    let table = "";
    let currRow = [];
    for (let i = 0; i < rows + 2; ++i) {
        table += "|\t";
        currRow = [];
        for (let j = 0; j < cols; ++j) {
            const rowIdx = i > 1 ? i - 1 : i;
            i === 1
                ? currRow.push("---\t")
                : currRow.push(data[`k_${rowIdx}_${j}`] || "");
        }
        table += currRow.join("\t|\t");
        table += "\t|\n";
    }

    return table;
}

export const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",").pop());
        reader.onerror = (error) => reject(error);
    });

export function checkImage(file) {
    // check filename suffix
    const isValidSuffix = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name);
    if (!isValidSuffix) {
        return {
            ok: false,
            msg: "请上传 JPG/PNG/GIF 格式的图片",
        };
    }

    // check file size
    const maxSize = 5;
    const isLt5M = file.size / 1024 / 1024 <= maxSize;
    if (!isLt5M) {
        return {
            ok: false,
            msg: `由于公众号限制，图片大小不能超过 ${maxSize}M`,
        };
    }
    return { ok: true };
}
