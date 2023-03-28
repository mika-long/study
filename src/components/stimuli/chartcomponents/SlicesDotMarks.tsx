export const SlicesDotMarks = ({ positions }: { positions: any[] }) => {
  return (
    <g>
      {positions.map((arc, i) => (
        <g key={i} transform={`translate(${arc.centroid()})`}>
          <circle key={i} r={2} cx={0} cy={0}></circle>
        </g>
      ))}
    </g>
  );
};
