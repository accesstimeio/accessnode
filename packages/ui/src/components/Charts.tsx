import { Bar, Area, BarChart, CartesianGrid, XAxis, AreaChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

export default function Charts({
  type,
  title,
  description,
  chartConfig,
  activeChart,
  data,
  extraData,
  setActiveChart
}: {
  type: "bar" | "area";
  title: string;
  description: string;
  chartConfig: ChartConfig;
  activeChart: string;
  data: any[];
  extraData: any;
  setActiveChart: (activeChart: any) => void;
}) {
  return (
    <Card className="p-0 m-0 border-0 shadow-none">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        <div className="flex">
          {Object.keys(extraData).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="cursor-pointer relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {extraData[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          {
            type == "bar"
              ? (
                <BarChart
                  accessibilityLayer
                  data={data}
                  margin={{
                    left: 0,
                    right: 0,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[150px]"
                        nameKey="views"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }}
                      />
                    }
                  />
                  <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                </BarChart>
              )
              : (
                <AreaChart
                  accessibilityLayer
                  data={data}
                  margin={{
                    left: 0,
                    right: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={`var(--color-${activeChart})`} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={`var(--color-${activeChart})`} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[150px]"
                        nameKey="views"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }}
                      />
                    }
                  />
                  <Area type="monotone" dataKey={activeChart} stroke={`var(--color-${activeChart})`} fill={`url(#colorArea)`} />
                </AreaChart>
              )
          }
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
