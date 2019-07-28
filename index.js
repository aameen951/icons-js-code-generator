const fs = require("promise-fs");

function uppercaseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function lowercaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
function dashed_to_underscored(str)
{
  return str.replace(/-/g, '_');
}
function dashed_to_camel_case(str)
{
  return lowercaseFirstLetter(str.split('-').map(w => uppercaseFirstLetter(w)).join(''));
}

const fa_free_solid_icons = require('@fortawesome/free-solid-svg-icons');
const fa_free_regular_icons = require('@fortawesome/free-regular-svg-icons');
const fa_free_brands_icons = require('@fortawesome/free-brands-svg-icons');

async function generate(ctx, opt)
{
  const icons = JSON.parse(await ctx.readDependency(opt.meta_file_rel_path));
  
  const lines = [];

  const fa_data = new Map(Object.entries({
    'fa-free-solid':{export_prefix: 's', package: fa_free_solid_icons},
    'fa-free-regular':{export_prefix: 'r', package: fa_free_regular_icons},
    'fa-free-brands':{export_prefix: 'b', package: fa_free_brands_icons},
  }));

  icons.forEach((icon, idx) => {
    // set the icon id
    if(fa_data.has(icon.type))
    {
      const data = fa_data.get(icon.type);
      const export_as = dashed_to_underscored(data.export_prefix + '-' + icon.name);
      const icon_name = dashed_to_camel_case(`fa-${icon.name}`);
      const icon_data = data.package[icon_name];
      lines.push(`export const ${export_as} = {w:${icon_data.icon[0]}, h:${icon_data.icon[1]}, u:"${icon_data.icon[3]}", v:"${icon_data.icon[4]}"};`);
    }
    else
    {
      throw new Error("Importing an icon of unknown type: "+icon.type);
    }
  });

  await ctx.generateCode(opt.output_file_rel_path, lines.join("\r\n")+"\r\n");
}

module.exports = (meta_file_rel_path, output_file_rel_path) => {
  const opt = {
    meta_file_rel_path,
    output_file_rel_path,
  };
  return (ctx) => generate(ctx, opt);
};
