export default class Text {

	static styles = [require('./text.styl')]
	static selector = 'text'

	static template = `
		<label .container
		.__active='focused or value'
		.__error='activity and error'>

			<input #input .input .__focused='focused'
			[type]='type'
			[value]='value'
			(focus)='onFocus()'
			(blur)='onBlur()'>

			<div *if='host.attrs.label' .label>
				{{ host.attrs.label }}
			</div>

		</label>
	`

	constructor() {
		this.value = ''
		this.type = 'text'
		this.focused = false
		this.error = false
		this.activity = false
		this.valueObserver = ui.watch(this, 'value', value => this.testValue(value))
		this.name = this.host.attr('name')
		this.form = this.require('form?')

		if (this.form) {
			this.form.addInput(this)
		}

		this.on('keydown', event => {
			let keyCode = event.realEvent.keyCode
			if (keyCode == 13) this.emit('submit')
		})
	}


	destructor() {
		if (this.form) {
			this.form.removeInput(this)
		}
		this.valueObserver.destroy()
	}


	reset() {
		let input = this.locals.input
		input.reset()
		this.value = input.value
	}


	testValue(value) {
		if (!this.test) {
			this.error = false
		}
		else if (typeof this.test === 'function') {
			this.error = !this.test(value)
		}
		else {
			this.error = !this.test.test(value)
		}
	}


	onFocus() {
		this.focused = true
	}


	onBlur() {
		this.activity = true
		this.focused = false
	}


}
