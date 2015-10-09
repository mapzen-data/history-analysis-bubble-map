# History Analysis Bubble Map

This is a visualisation of data extracted from the editing history of [OSM](http://openstreetmap.org) in selected [metro extract](https://mapzen.com/data/metro-extracts/) areas. Data extraction was performed using the workflow in the [history analysis Chef recipe](https://github.com/mapzen/chef-history-analysis), which slices and dices using a combination of the [OSM history splitter](https://github.com/mazdermind/osm-history-splitter), [osmium-tool](https://github.com/osmcode/libosmium), [osm2pgsql](https://github.com/openstreetmap/osm2pgsql) and [data analysis scripts](https://github.com/IndyHurt/india-data-analysis/). It uses a combination of [d3](http://d3js.org/) and [c3](http://c3js.org/) to draw the graphs.

## Interface

It loads a bubble for each city, which can be selected to include that city's data in the graph below (it'll also turn the bubble red). The drop-down selector at the top controls which statistic to draw. There's a slider over the time range to choose the year for which the bubbles are displayed. The chart below shows the complete time range for each selected city.

## Known issues

The code is pretty awful. Sometimes it doesn't update either the chart or the graph correctly when updating either the drop-down selection or the slider. Usually, altering the selection a few times will get everything lined up. It can get pretty slow when there's a lot of data.
