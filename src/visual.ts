"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import * as d3 from "d3";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings";
import {
    createTooltipServiceWrapper,
    ITooltipServiceWrapper
} from "powerbi-visuals-utils-tooltiputils";

type BarDatum = {
    category: string;
    value: number;
    target: number | null;
};

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private dataView: powerbi.DataView;

    // D3 chart members
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private barsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private targetLine: d3.Selection<SVGLineElement, unknown, null, undefined>;
    private barScale: d3.Selection<SVGElement, unknown, null, undefined>;

    // Chart margins (kept as instance state so update() can reuse them)
    private readonly marginTop = 20;
    private readonly marginRight = 20;
    private readonly marginBottom = 30;
    private readonly marginLeft = 40;




    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
        if (document) {
            // Create the SVG container once; it will be resized/redrawn in update()
            this.svg = d3.select(this.target)
                .append("svg")
                .attr("class", "chart-svg");


            // Empty axis groups created up front, populated on each update()
            this.xAxisGroup = this.svg.append("g")
                .attr("class", "x-axis");

            this.yAxisGroup = this.svg.append("g")
                .attr("class", "y-axis");



            this.barScale = this.svg.append("g")
                .attr("class", "bar-scale");

            this.barsGroup = this.svg.append("g")
                .attr("class", "bars");
            this.targetLine = this.svg.append("line").attr("class", "target-line");
        }
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        this.dataView = options.dataViews[0];

        const categorical = this.dataView && this.dataView.categorical;
        if (!categorical || !categorical.categories?.length || !categorical.values?.length) {
            // nothing bound yet — clear the visual and bail
            this.barsGroup.selectAll("rect").remove();
            return;
        }

        const categoryColumn = categorical.categories[0];
        const valueColumn = categorical.values[0];
        const targetColumn = categorical.values[1];

        const data: BarDatum[] = categoryColumn.values.map((categoryValue, i) => ({
            category: String(categoryValue),
            value: Number(valueColumn.values[i]),
            target: targetColumn ? Number(targetColumn.values[i]) : null
        }));



        try {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);

            console.log('Visual update', options);

            // Use the visual's actual viewport instead of hardcoded 640x400
            const width = options.viewport.width;
            const height = options.viewport.height;

            const y = d3.scaleBand()
                .domain(data.map(d => d.category))   // ["Jan", "Feb", "Mar"]
                .range([this.marginTop, height - this.marginBottom])
                .padding(0.1);                  // gap between bars


            const x = d3.scaleLinear()
                .domain([0, 100])   // 0 to the largest value
                .range([this.marginLeft, width - this.marginRight]);                     // gap between bars



            // this.barScale.selectAll("rect")
            //     .data(data)
            //     .join("rect")
            //     .attr("x", d => x(0))
            //     .attr("y", d => y(d.category))
            //     .attr("width", width - this.marginRight - this.marginLeft)  // width of the bar based on value
            //     .attr("height", y.bandwidth())
            //     .attr("fill", "#eee")
            //     .attr("rx", 4);


            const bars = this.barsGroup
                .selectAll<SVGRectElement, BarDatum>("rect")
                .data(data)
                .join("rect")
                .attr("x", d => x(0))
                .attr("y", d => y(d.category))
                .attr("width", d => x(d.value) - x(0))  // width of the bar based on value
                .attr("height", y.bandwidth())
                .attr("fill", this.formattingSettings.barSettings.BarColour.value.value)
                .attr("rx", 4);

            this.tooltipServiceWrapper.addTooltip(
                bars,
                (d: BarDatum) => {
                    const tooltipData = [
                        {
                            displayName: "Category",
                            value: d.category
                        },
                        {
                            displayName: "Value",
                            value: d.value.toString()
                        }
                    ];

                    if (d.target !== null) {
                        tooltipData.push({
                            displayName: "Target",
                            value: d.target.toString()
                        });
                    }

                    return tooltipData;
                }
            );

            console.log('Bars drawn', this.barsGroup.selectAll("rect").attr("x"), this.barsGroup.selectAll("rect").attr("y"));

            this.svg
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`);

            this.targetLine
                .data(data) // Bind data to the line
                .attr("x1", d => x(d.target)) // Add target value
                .attr("y1", (this.marginTop * 1.3))
                .attr("x2", d => x(d.target)) // Add target value
                .attr("y2", height - (this.marginBottom * 1.3))
                .attr("stroke", this.formattingSettings.targetLineSettings.TargetLineColour.value.value)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,4");

            this.xAxisGroup
                .attr("transform", `translate(0,${height - this.marginBottom})`)
                .call(d3.axisBottom(x) as any);

            // Update the y-axis.
            // this.yAxisGroup
            //     .attr("transform", `translate(${this.marginLeft},0)`)
            //     .call(d3.axisLeft(y) as any);

            this.events.renderingFinished(options);
        }
        catch (error) {
            console.log('Error in update method', error);
            this.events.renderingFailed(options, String(error))
        }
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}