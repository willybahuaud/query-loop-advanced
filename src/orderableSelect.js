import React from 'react';
import Select, { components } from 'react-select';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
const { __ } = wp.i18n
const { Component } = wp.element
export default class SelecteurMultiple extends Component {
	constructor(props) {
		super(...arguments);
		this.props = props;
		this.state = {
			selected: this.props.selected,
		}
	}
	arrayMove(array, from, to) {
		array = array.slice();
		array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
		return array;
	};
	shouldComponentUpdate = (nextProps, nextState, nextContext) => {
		return !(nextProps == this.props) ||
			!(nextState == this.state) ||
			!(nextContext == this.context);
	}
	
	render() {
		const onChange = selectedOptions => {
			this.setState({ selected: selectedOptions })
			this.props.onChange(selectedOptions);
		};
		const onSortEnd = ({ oldIndex, newIndex }) => {
			const newValue = this.arrayMove(this.state.selected, oldIndex, newIndex);
			this.setState({ selected: newValue });
			this.props.onChange(this.state.selected);
		};
		const SortableMultiValue = SortableElement(props => {
			const onMouseDown = e => {
				e.preventDefault();
				e.stopPropagation();
			};
			const innerProps = { onMouseDown };
			return <components.MultiValue {...props} innerProps={innerProps} className="sortableHelper"/>;
		});
		const SortableSelect = SortableContainer(Select);
		return (
			<SortableSelect
				// react-sortable-hoc props:
				axis="xy"
				onSortEnd={onSortEnd}
				distance={4}
				// small fix for https://github.com/clauderic/react-sortable-hoc/pull/352:
				getHelperDimensions={({ node }) => node.getBoundingClientRect()}
				// react-select props:
				isMulti
				options={this.props.options}
				value={this.state.selected}
				onChange={onChange}
				components={{
					MultiValue: SortableMultiValue,
				}}
				closeMenuOnSelect={false}
			/>
		)
	}
}