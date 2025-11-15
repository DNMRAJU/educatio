import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const VisualizationComponent = ({ visualizations }) => {
  if (!visualizations || visualizations.length === 0) {
    return (
      <div className="px-4 py-3 text-gray-500">
        No visualizations available.
      </div>
    );
  }

  const renderChart = (viz, index) => {
    const { type, data, title, description } = viz;

    if (!data || data.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for this visualization</p>
        </div>
      );
    }

    const chartContent = () => {
      switch (type?.toLowerCase()) {
        case 'line':
        case 'linechart':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viz.xAxis || 'name'} />
                <YAxis />
                <Tooltip />
                <Legend />
                {viz.lines ? (
                  viz.lines.map((line, idx) => (
                    <Line
                      key={idx}
                      type="monotone"
                      dataKey={line.dataKey || line}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))
                ) : (
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          );

        case 'bar':
        case 'barchart':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viz.xAxis || 'name'} />
                <YAxis />
                <Tooltip />
                <Legend />
                {viz.bars ? (
                  viz.bars.map((bar, idx) => (
                    <Bar
                      key={idx}
                      dataKey={bar.dataKey || bar}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))
                ) : (
                  <Bar dataKey="value" fill="#8884d8" />
                )}
              </BarChart>
            </ResponsiveContainer>
          );

        case 'pie':
        case 'piechart':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          );

        case 'area':
        case 'areachart':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viz.xAxis || 'name'} />
                <YAxis />
                <Tooltip />
                <Legend />
                {viz.areas ? (
                  viz.areas.map((area, idx) => (
                    <Area
                      key={idx}
                      type="monotone"
                      dataKey={area.dataKey || area}
                      stroke={COLORS[idx % COLORS.length]}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.6}
                    />
                  ))
                ) : (
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          );

        case 'radar':
        case 'radarchart':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey={viz.angleAxis || 'subject'} />
                <PolarRadiusAxis />
                {viz.radars ? (
                  viz.radars.map((radar, idx) => (
                    <Radar
                      key={idx}
                      name={radar.name || radar}
                      dataKey={radar.dataKey || radar}
                      stroke={COLORS[idx % COLORS.length]}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.6}
                    />
                  ))
                ) : (
                  <Radar
                    name="Value"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                )}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          );

        default:
          // If type is not recognized, try to render as a simple bar chart
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(data[0])[0]} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={Object.keys(data[0])[1] || 'value'} fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          );
      }
    };

    return (
      <div key={index} className="mb-6">
        {title && (
          <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        )}
        {description && (
          <p className="text-xs text-gray-500 mb-3">{description}</p>
        )}
        <div className="bg-white rounded-lg p-4">
          {chartContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-4">
      {Array.isArray(visualizations) ? (
        visualizations.map((viz, index) => renderChart(viz, index))
      ) : (
        renderChart(visualizations, 0)
      )}
    </div>
  );
};

export default VisualizationComponent;
