const {existsSync, mkdirSync, writeFileSync, rmSync, readdirSync} = require('fs');

readdirSync(__dirname).forEach(file => {
    console.log(file);
});
readdirSync('/').forEach(file => {
    console.log(file);
});


readdirSync('.').forEach(file => {
    console.log(file);
});

const tokensJson = require(`./tokens.json`);
const baseDir = `${__dirname}/tokens`;

if (existsSync(baseDir)) {
    rmSync(`${baseDir}`, {recursive: true});
    mkdirSync(baseDir)
}

const themes = Object.keys(tokensJson.color);

for (const theme of themes) {
    const dir = `${baseDir}/${theme}`;
    mkdirSync(dir);
    writeFileSync(`${dir}/colors.json`, JSON.stringify({
        color: tokensJson.color[theme], shadow: tokensJson.shadow[theme]
    }, null, 2));

    if (tokensJson.typography && tokensJson.spacing && tokensJson.radius) {
        writeFileSync(`${__dirname}/tokens/global.json`, JSON.stringify({
            font: tokensJson.typography, spacing: tokensJson.spacing, radius: tokensJson.radius
        }, null, 2))
    }

}

console.log(`🚧 Preparing palettes for ${themes.join(' | ')}`);