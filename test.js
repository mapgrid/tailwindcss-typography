const _ = require('lodash');
const cssMatcher = require('jest-matcher-css');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const defaultConfig = require('tailwindcss/defaultConfig');
const typographyPlugin = require('./index.js');

const generatePluginCss = (config) => {
  return postcss(
    tailwindcss(
      _.merge({
        theme: {
          screens: {
            'sm': '640px',
          },
        },
        corePlugins: (function() {
          let disabledCorePlugins = {};
          Object.keys(defaultConfig.variants).forEach(corePlugin => {
            disabledCorePlugins[corePlugin] = false;
          });
          return disabledCorePlugins;
        })(),
        plugins: [
          typographyPlugin(),
        ],
      }, config)
    )
  )
  .process('@tailwind utilities;', {
    from: undefined,
  })
  .then(result => {
    return result.css;
  });
};

expect.extend({
  toMatchCss: cssMatcher,
});

test('the plugin generates some responsive utilities by default', () => {
  return generatePluginCss().then(css => {
    expect(css).toMatchCss(`
      .ellipsis {
        text-overflow: ellipsis;
      }
      .hyphens-none {
        hyphens: none;
      }
      .hyphens-manual {
        hyphens: manual;
      }
      .hyphens-auto {
        hyphens: auto;
      }
      @media (min-width: 640px) {
        .sm\\:ellipsis {
          text-overflow: ellipsis;
        }
        .sm\\:hyphens-none {
          hyphens: none;
        }
        .sm\\:hyphens-manual {
          hyphens: manual;
        }
        .sm\\:hyphens-auto {
          hyphens: auto;
        }
      }
    `);
  });
});

test('text indent and text shadow utilities can be generated by adding keys to the theme', () => {
  return generatePluginCss({
    theme: {
      textIndent: {
        '1': '0.25rem',
        '2': '0.5rem',
      },
      textShadow: {
        'default': '0 2px 5px rgba(0, 0, 0, .5)',
        'lg': '0 2px 10px rgba(0, 0, 0, .5)',
      },
    },
    variants: {
      ellipsis: [],
      hyphens: [],
      textIndent: [],
      textShadow: [],
    },
  }).then(css => {
    expect(css).toMatchCss(`
      .ellipsis {
        text-overflow: ellipsis;
      }
      .hyphens-none {
        hyphens: none;
      }
      .hyphens-manual {
        hyphens: manual;
      }
      .hyphens-auto {
        hyphens: auto;
      }
      .indent-1 {
        text-indent: .25rem;
      }
      .indent-2 {
        text-indent: .5rem;
      }
      .text-shadow {
        text-shadow: 0 2px 5px rgba(0, 0, 0, .5);
      }
      .text-shadow-lg {
        text-shadow: 0 2px 10px rgba(0, 0, 0, .5);
      }
    `);
  });
});

test('variants can be customized', () => {
  return generatePluginCss({
    variants: {
      ellipsis: ['hover'],
      hyphens: ['active'],
    },
  }).then(css => {
    expect(css).toMatchCss(`
      .ellipsis {
        text-overflow: ellipsis;
      }
      .hover\\:ellipsis:hover {
        text-overflow: ellipsis;
      }
      .hyphens-none {
        hyphens: none;
      }
      .hyphens-manual {
        hyphens: manual;
      }
      .hyphens-auto {
        hyphens: auto;
      }
      .active\\:hyphens-none:active {
        hyphens: none;
      }
      .active\\:hyphens-manual:active {
        hyphens: manual;
      }
      .active\\:hyphens-auto:active {
        hyphens: auto;
      }
    `);
  });
});
