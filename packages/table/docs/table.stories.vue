<script setup lang="ts">
// import Animation from './animation.tsx'
// import Aria from './aria.tsx'
// import Caption from './caption.tsx'
// import ClassName from './className.tsx'
// import ClickSummaryRow from './click-summary-row.tsx'
// import ColspanRowspanLegacy from './colspan-rowspan-legacy.tsx'
// import ColspanRowspan from './colspan-rowspan.tsx'
// import ColumnHidden from './column-hidden.tsx'
// import ColumnResize from './column-resize.tsx'
// import Components from './components.tsx'
// import Dropdown from './dropdown.tsx'
// import EllipsisCustomTooltip from './ellipsis-custom-tooltip.tsx'
// import Ellipsis from './ellipsis.tsx'
// import ExpandedRowClassName from './expandedRowClassName.tsx'
// import ExpandedRowRender from './expandedRowRender.tsx'
// import ExpandedSticky from './expandedSticky.tsx'
// import ExpandIcon from './expandIcon.tsx'
// import FixedColumnsAutoHeight from './fixedColumns-auto-height.tsx'
// import FixedColumnsResize from './fixedColumns-resize.tsx'
// import FixedColumns from './fixedColumns.tsx'
// import FixedColumnsAndHeader from './fixedColumnsAndHeader.tsx'
// import FixedColumnsAndHeaderRtl from './fixedColumnsAndHeaderRtl.tsx'
// import GroupingColumnsHidden from './grouping-columns-hidden.tsx'
// import GroupingColumns from './grouping-columns.tsx'
// import HideHeader from './hide-header.tsx'
// import HoverPerf from './hover-perf.tsx'
// import Jsx from './jsx.tsx'
// import Key from './key.tsx'
// import MeasureRowRender from './measureRowRender.tsx'
// import Nested from './nested.tsx'
// import NoData from './no-data.tsx'
// import ReactDnd from './react-dnd.tsx'
// import RowHoverable from './row-hoverable.tsx'
// import RowAndCellClick from './rowAndCellClick.tsx'
// import ScopeCol from './scopeCol.tsx'
// import ScopeRow from './scopeRow.tsx'
import ScrollX from './scrollX.tsx'

import ScrollXY from './scrollXY.tsx'
import ScrollY from './scrollY.tsx'
// import Shadow from './shadow.tsx'
import Simple from './simple.tsx'
import './assets/index.less'
// import StickyHeader from './stickyHeader.tsx'
// import StickyHeaderAndSummary from './stickyHeaderAndSummary.tsx'
// import StyledComponents from './styled-components.tsx'
// import SubTable from './subTable.tsx'
// import TitleAndFooter from './title-and-footer.tsx'
// import VirtualColumns from './virtual-columns.tsx'
// import VirtualListGrid from './virtual-list-grid.tsx'
// import VirtualList from './virtual-list.tsx'
// import Virtual from './virtual.tsx'
</script>

<template>
  <Story title="Table">
    <Variant title="simple">
      <Simple />
    </Variant>
    <Variant title="scroll-x">
      <ScrollX />
    </Variant>
    <Variant title="scroll-y">
      <ScrollY />
    </Variant>
    <Variant title="scroll-xy">
      <ScrollXY />
    </Variant>
    <Variant title="fixed-columns">
      <!--      <FixedColumns /> -->
    </Variant>
    <Variant title="fixed-columns-auto-height">
      <!--      <FixedColumnsAutoHeight /> -->
    </Variant>
    <Variant title="fixed-columns-resize">
      <!--      <FixedColumnsResize /> -->
    </Variant>
    <Variant title="fixed-columns-and-header">
      <!--      <FixedColumnsAndHeader /> -->
    </Variant>
    <Variant title="fixed-columns-and-header-rtl">
      <!--      <FixedColumnsAndHeaderRtl /> -->
    </Variant>
    <Variant title="grouping-columns">
      <!--      <GroupingColumns /> -->
    </Variant>
    <Variant title="grouping-columns-hidden">
      <!--      <GroupingColumnsHidden /> -->
    </Variant>
    <Variant title="column-hidden">
      <!--      <ColumnHidden /> -->
    </Variant>
    <Variant title="column-resize">
      <!--      <ColumnResize /> -->
    </Variant>
    <Variant title="colspan-rowspan">
      <!--      <ColspanRowspan /> -->
    </Variant>
    <Variant title="colspan-rowspan-legacy">
      <!--      <ColspanRowspanLegacy /> -->
    </Variant>
    <Variant title="components">
      <!--      <Components /> -->
    </Variant>
    <Variant title="dropdown">
      <!--      <Dropdown /> -->
    </Variant>
    <Variant title="ellipsis">
      <!--      <Ellipsis /> -->
    </Variant>
    <Variant title="ellipsis-custom-tooltip">
      <!--      <EllipsisCustomTooltip /> -->
    </Variant>
    <Variant title="expand-icon">
      <!--      <ExpandIcon /> -->
    </Variant>
    <Variant title="expanded-row-classname">
      <!--      <ExpandedRowClassName /> -->
    </Variant>
    <Variant title="expanded-row-render">
      <!--      <ExpandedRowRender /> -->
    </Variant>
    <Variant title="expanded-sticky">
      <!--      <ExpandedSticky /> -->
    </Variant>
    <Variant title="hide-header">
      <!--      <HideHeader /> -->
    </Variant>
    <Variant title="row-hoverable">
      <!--      <RowHoverable /> -->
    </Variant>
    <Variant title="row-and-cell-click">
      <!--      <RowAndCellClick /> -->
    </Variant>
    <Variant title="key">
      <!--      <Key /> -->
    </Variant>
    <Variant title="nested">
      <!--      <Nested /> -->
    </Variant>
    <Variant title="no-data">
      <!--      <NoData /> -->
    </Variant>
    <Variant title="aria">
      <!--      <Aria /> -->
    </Variant>
    <Variant title="caption">
      <!--      <Caption /> -->
    </Variant>
    <Variant title="class-name">
      <!--      <ClassName /> -->
    </Variant>
    <Variant title="click-summary-row">
      <!--      <ClickSummaryRow /> -->
    </Variant>
    <Variant title="hover-perf">
      <!--      <HoverPerf /> -->
    </Variant>
    <Variant title="jsx">
      <!--      <Jsx /> -->
    </Variant>
    <Variant title="measure-row-render">
      <!--      <MeasureRowRender /> -->
    </Variant>
    <Variant title="scope-col">
      <!--      <ScopeCol /> -->
    </Variant>
    <Variant title="scope-row">
      <!--      <ScopeRow /> -->
    </Variant>
    <Variant title="shadow">
      <!--      <Shadow /> -->
    </Variant>
    <Variant title="sticky-header">
      <!--      <StickyHeader /> -->
    </Variant>
    <Variant title="sticky-header-and-summary">
      <!--      <StickyHeaderAndSummary /> -->
    </Variant>
    <Variant title="styled-components">
      <!--      <StyledComponents /> -->
    </Variant>
    <Variant title="sub-table">
      <!--      <SubTable /> -->
    </Variant>
    <Variant title="title-and-footer">
      <!--      <TitleAndFooter /> -->
    </Variant>
    <Variant title="animation">
      <!--      <Animation /> -->
    </Variant>
    <Variant title="react-dnd">
      <!--      <ReactDnd /> -->
    </Variant>
    <Variant title="virtual">
      <!--      <Virtual /> -->
    </Variant>
    <Variant title="virtual-columns">
      <!--      <VirtualColumns /> -->
    </Variant>
    <Variant title="virtual-list">
      <!--      <VirtualList /> -->
    </Variant>
    <Variant title="virtual-list-grid">
      <!--      <VirtualListGrid /> -->
    </Variant>
  </Story>
</template>
