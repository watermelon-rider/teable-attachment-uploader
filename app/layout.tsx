import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeaUploader - Teable 批量上传工具",
  description: "Teable 批量附件上传和嵌图表格导入工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
