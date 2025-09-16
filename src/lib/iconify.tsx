import { Icon, addIcon } from "@iconify/react";

// enum LogoEnum {
//   // https://icon-sets.iconify.design/svg-spinners/
//   spinners = "svg-spinners:pulse-multiple",
// }

// Use Iconify to render logo
// addIcon(LogoEnum.spinners, {
//   body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="0" fill="currentColor"><animate id="SVGPW9ARccz" fill="freeze" attributeName="r" begin="0;SVGaeu34cWL.end" calcMode="spline" dur="1.98s" keySplines=".52,.6,.25,.99" values="0;11"/><animate fill="freeze" attributeName="opacity" begin="0;SVGaeu34cWL.end" calcMode="spline" dur="1.98s" keySplines=".52,.6,.25,.99" values="1;0"/></circle><circle cx="12" cy="12" r="0" fill="currentColor"><animate id="SVGODvPjeTJ" fill="freeze" attributeName="r" begin="SVGPW9ARccz.begin+0.33s" calcMode="spline" dur="1.98s" keySplines=".52,.6,.25,.99" values="0;11"/><animate fill="freeze" attributeName="opacity" begin="SVGPW9ARccz.begin+0.33s" calcMode="spline" dur="1.98s" keySplines=".52,.6,.25,.99" values="1;0"/></circle><circle cx="12" cy="12" r="0" fill="currentColor"><animate id="SVGaeu34cWL" fill="freeze" attributeName="r" begin="SVGPW9ARccz.begin+0.66s" calcMode="spline" dur="1.98s" keySplines=".52,.6,.25,.99" values="0;11"/><animate fill="freeze" attributeName="opacity" begin="SVGPW9ARccz.begin+0.66s" calcMode="spline" dur="1.98s" keySplines=".52,.6,.25,.99" values="1;0"/></circle></svg>',
// });

// 直接从Iconify拷贝jsx svg

export function LogoIcon({ style }: { style?: React.CSSProperties }) {
  // 修正Icon组件的使用方式
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
    >
      <circle cx={12} cy={12} r={0} fill="currentColor">
        <animate
          id="SVGPW9ARccz"
          fill="freeze"
          attributeName="r"
          begin="0;SVGaeu34cWL.end"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          values="0;11"
        ></animate>
        <animate
          fill="freeze"
          attributeName="opacity"
          begin="0;SVGaeu34cWL.end"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          values="1;0"
        ></animate>
      </circle>
      <circle cx={12} cy={12} r={0} fill="currentColor">
        <animate
          id="SVGODvPjeTJ"
          fill="freeze"
          attributeName="r"
          begin="SVGPW9ARccz.begin+0.2s"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          values="0;11"
        ></animate>
        <animate
          fill="freeze"
          attributeName="opacity"
          begin="SVGPW9ARccz.begin+0.2s"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          values="1;0"
        ></animate>
      </circle>
      <circle cx={12} cy={12} r={0} fill="currentColor">
        <animate
          id="SVGaeu34cWL"
          fill="freeze"
          attributeName="r"
          begin="SVGPW9ARccz.begin+0.4s"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          values="0;11"
        ></animate>
        <animate
          fill="freeze"
          attributeName="opacity"
          begin="SVGPW9ARccz.begin+0.4s"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          values="1;0"
        ></animate>
      </circle>
    </svg>
  );
}

// 下面这种用法是关于pnpm add @iconify-icons/line-md 直接安装的形式
// https://icon-sets.iconify.design/line-md/page-3.html?icon-filter=remove
function LineMdIconRemove({ style }: { style?: React.CSSProperties }) {
  return <Icon icon="line-md:file-document-remove-twotone" style={style} />;
}

// https://icon-sets.iconify.design/line-md/page-3.html?icon-filter=add
function LineMdIconAdd({ style }: { style?: React.CSSProperties }) {
  return <Icon icon="line-md:document-add-twotone" style={style} />;
}

// https://icon-sets.iconify.design/line-md/page-3.html?icon-filter=edit
function LineMdIconEdit({ style }: { style?: React.CSSProperties }) {
  return <Icon icon="line-md:edit-filled" style={style} />;
}

export { LineMdIconAdd, LineMdIconEdit, LineMdIconRemove };
