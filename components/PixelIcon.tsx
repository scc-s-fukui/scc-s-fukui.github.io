type PixelIconProps = {
  /** 1文字=1ドットの文字列配列（"." は透明）。全行同じ長さにする */
  rows: string[];
  /** 文字→色の対応 */
  palette: Record<string, string>;
  /** 1ドットの表示サイズ（px） */
  size?: number;
  className?: string;
};

/** 文字列で定義したドット絵をSVGで描く。拡大してもにじまない（crispEdges） */
export default function PixelIcon({ rows, palette, size = 6, className }: PixelIconProps) {
  const width = rows[0]?.length ?? 0;
  const height = rows.length;

  return (
    <svg
      className={className}
      width={width * size}
      height={height * size}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === "." || !palette[ch] ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[ch]} />,
        ),
      )}
    </svg>
  );
}
