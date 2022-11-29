const StyleDictionary = require("style-dictionary");
const tokensJson = require(__dirname + '/figma-tokens/tokens.json');

// Look for args passed on the command line
const args = require("minimist")(process.argv.slice(2));
const themes = args.theme ? args.theme.split(',') : ["baselight", "basedark"];
const getStyleDictionaryBaseConfig = () => {
    return {
        log: "warn",
        source: [
            `./tokens/*.json`,
        ],
        platforms: {
            css: {
                transformGroup: "custom/css",
                buildPath: "projects/components/style/tokens/",
                files: [
                    {
                        destination: 'global.tokens.css',
                        format: "css/variables",
                        selector: ':root'
                    }
                ],
            },
        },
    };
};


const getStyleDictionaryThemeConfig = (theme) => {
    return {
        log: "warn",
        source: [
            `./tokens/${theme}/*.json`,
        ],
        platforms: {
            css: {
                transformGroup: "custom/css",
                buildPath: "projects/components/style/tokens/",
                files: [
                    {
                        destination: `${theme}.tokens.css`,
                        format: "css/variables",
                        selector: `html[data-theme='${theme}']`
                    }
                ],
            },
        },
    };
};

StyleDictionary.registerFormat({
    name: 'css/variables',
    formatter: function (dictionary, config) {
        return `${this.selector} {
      ${dictionary.allProperties.map(prop => `  --${prop.name}: ${prop.value};`).join('\n')}
    }`
    }
});

StyleDictionary.registerTransform({
    name: 'css/shadows',
    type: 'value',
    matcher: function (prop) {
        return prop.attributes.category === 'shadow';
    },
    transformer: token => {
        const {
            offsetX,
            offsetY,
            radius,
            spread,
            color
        } = token.original.value;
        return `${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color}`
    }
});

StyleDictionary.registerTransform({
    name: 'css/radius',
    type: 'value',
    matcher: function (prop) {
        return prop.attributes.category === 'radius';
    },
    transformer: token => {
        const {
            topLeft
        } = token.original.value;
        return `${topLeft}px`
    }
});
StyleDictionary.registerTransform({
    name: 'css/spacing',
    type: 'value',
    matcher: function (prop) {
        return prop.attributes.category === 'spacing';
    },
    transformer: token => {
        const {
            top
        } = token.original.value;
        return `${top}px`
    }
});


StyleDictionary.registerTransformGroup({
    name: 'custom/css',
    transforms: StyleDictionary.transformGroup['css'].concat([
        'css/shadows',
        'css/radius',
        'css/spacing'
    ])
})


const utilities = [
    {
        "name": "color",
        "tokenType": "color",
        "CSSprop": "color"
    },
    {
        "name": "bg",
        "tokenType": "color",
        "CSSprop": "background-color"
    },
    {
        "name": "border",
        "tokenType": "color",
        "CSSprop": "border-color"
    },
    {
        "name": "fill",
        "tokenType": "color",
        "CSSprop": "fill"
    },
];

StyleDictionary.registerFilter({
    name: 'utilityToken',
    matcher: function(token) {
        return token.type === 'color'
    }
})


StyleDictionary.registerFormat({
    name: 'utility',
    formatter: function(dictionary, platform) {
        let output = '';
        dictionary.allProperties.forEach(function(prop) {

            if(prop.path.indexOf('chart') > 0) {
                return;
            }

            const tokenType = prop.path.slice(0, 1)[0];

            utilities.forEach(function(utility) {
                if (tokenType === utility.tokenType) {
                    var utilityClass = utility.name + '-' + prop.path[1] + '-' + prop.path[2];
                    output += `.${utilityClass} {
  ${utility.CSSprop}: var(--color-${prop.path[1]}-${prop.path[2]});
}\n\n`
                }
            });
        });
        return output;
    }
});


// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration

for(const theme of themes) {

    console.log(`🚧 Compiling tokens with the ${theme} theme`);

    const StyleDictionaryBase = StyleDictionary.extend(getStyleDictionaryBaseConfig())
    const StyleDictionaryTheming = StyleDictionary.extend(
        getStyleDictionaryThemeConfig(theme)
    );


    const StyleDictionaryUtility = StyleDictionary.extend({
        log: "warn",
        properties: {
            color: {
                ...tokensJson.color[theme]
            }
        },
        platforms: {
            css: {
                transformGroup: "css",
                buildPath: "projects/components/style/tokens/",
                files: [
                    {
                        destination: 'utility.tokens.css',
                        format: "utility"
                    }
                ],
            },
        },
    })


    // BUILD ALL THE PLATFORMS
    StyleDictionaryBase.buildAllPlatforms();
    StyleDictionaryTheming.buildAllPlatforms();
    StyleDictionaryUtility.buildAllPlatforms();


}



