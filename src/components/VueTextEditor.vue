<template>
  <div class="v-text-editor">
    <div v-if="prependIcon" class="v-text-editor__prepend-icon">
      <v-icon>{{ prependIcon }}</v-icon>
    </div>
    <div
      class="v-text-editor__container"
      :class="className + ' ' + (outlined && 'v-text-editor__outlined')"
      :style="{ ...style, borderColor }"
    >
      <Header
        :accentColor="accentColor"
        :bgColor="bgColor"
        :groups="groups"
        :headerMinHeight="headerMinHeight"
        :headerStyle="headerStyle"
        :iconColor="iconColor"
        :options="options"
        :outlined="outlined"
        @fileUpload="onFileUpload($event)"
        @insertLink="insertLink($event)"
        @linkMenuChange="linkMenu = $event"
        @optionClick="onOptionClick($event)"
        @removeLink="removeLink()"
        @saveSelection="saveSelection()"
        @setColor="setColor($event)"
      />

      <div
        v-if="files.length && isGroupActive('embed')"
        class="v-text-editor__files px-3"
      >
        <v-chip
          :key="file.name"
          v-for="(file, index) in files"
          class="ma-2"
          close
          :color="accentColor"
          :text-color="
            _calculateColorBrightness(accentColor) <= 170 ? 'white' : 'black'
          "
          @click:close="removeFile(file, index)"
        >
          {{ file.name }} ({{ _calculateFileSize(file.size) }})
        </v-chip>
      </div>

      <div
        class="v-text-editor__textarea px-4"
        contenteditable="true"
        :placeholder="placeholder"
        :style="{ color: baseTextColor }"
        @keydown="
          (e) => {
            if (
              maxLength &&
              +maxLength <=
                e.target.innerText.replace(/\r?\n|\r/g, '').length &&
              !safeKeys.filter((key) => e.code.includes(key.replace('*', '')))
                .length &&
              !(isControlPressed && e.code === 'KeyZ')
            ) {
              console.log(e.code)
              e.preventDefault()
            }
          }
        "
        @blur="(e) => this.linkMenu && e.preventDefault()"
        @input="onInput"
      ></div>

      <div class="v-text-editor__details px-3 py-1">
        <span
          v-if="counter"
          class="v-text-editor__counter"
          :style="{
            color:
              filledPercentage >= 100
                ? totalFillCounterColor
                : filledPercentage >= 70
                ? partialFillCounterColor
                : counterColor === '#1d1d1d' &&
                  _calculateColorBrightness(bgColor) <= 170
                ? '#f5f5f5'
                : counterColor,
          }"
        >
          {{ textLength }}
          <span v-if="maxLength" class="v-text-editor-maxlength"
            >/ {{ maxLength }}</span
          >
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Header from './Header.vue'

import { calculateColorBrightness, rgba2hex } from '../utils/color'
import { calculateFileSize } from '../utils/file'

export default Vue.extend({
  name: 'VueTextEditor',
  components: {
    Header,
  },
  props: {
    /**
     * Property that defines the classes to be applied to
     * the editor container.
     *
     * @default ```empty string```
     */
    className: {
      type: String,
      required: false,
      default: '',
    },

    /**
     * Property that defines the initial text value to
     * be set into the editor.
     */
    value: {
      type: String,
      required: false,
      default: '',
    },

    /**
     * Property that defines the editor width.
     *
     * The min width is 260px.
     *
     * @default ```100%```
     */
    width: {
      type: [Number, String],
      required: false,
      default: '100%',
      validator: (v): boolean => typeof v !== 'number' || v >= 0,
    },

    /**
     * Property that defines the editor height.
     *
     * @default ```auto```
     */
    height: {
      type: [Number, String],
      required: false,
      default: 'auto',
      validator: (v): boolean => typeof v !== 'number' || v >= 0,
    },

    /**
     * Property that defines the editor background color.
     *
     * @default ```#f5f5f5```
     */
    bgColor: {
      type: String,
      required: false,
      default: '#f5f5f5',
    },

    /**
     * Property that defines the container border color in case
     * the outlined property is true.
     *
     * @default ```#8e8e8e```
     */
    borderColor: {
      type: String,
      required: false,
      default: '#8e8e8e',
    },

    /**
     * Property that defines the header height.
     *
     * @default ```50```
     */
    headerMinHeight: {
      type: [Number, String],
      required: false,
      default: 50,
      validator: (v): boolean => typeof v !== 'number' || v >= 0,
    },

    /**
     * Property that defines the header inactive icons color.
     *
     * @default ```#535353```
     */
    iconColor: {
      type: String,
      required: false,
      default: '#535353',
    },

    /**
     * Property that defines the editor accent color.
     *
     * @default ```#1867c0```
     */
    accentColor: {
      type: String,
      required: false,
      default: '#1867c0',
    },

    /**
     * Property that defines whether the component is outlined.
     *
     * @default ```false```
     */
    outlined: Boolean,

    /**
     * Property that defines the editor placeholder.
     *
     * @default ```Type here...```
     */
    placeholder: {
      type: String,
      required: false,
      default: 'Type here...',
    },

    /**
     * Property that defines the max character length of the text.
     *
     * @default ```null```
     */
    maxLength: {
      type: [Number, String],
      required: false,
      default: null,
      validator: (v): boolean =>
        !v ||
        ((typeof v === 'number' ||
          (typeof v === 'string' && !isNaN(parseInt(v)))) &&
          +v > 0),
    },

    /**
     * Property that defines whether the counter element will be
     * shown.
     *
     * The counter element shows the current text length, ignoring
     * all line breaks.
     *
     * @default ```false```
     */
    counter: Boolean,

    /**
     * Property that defines the counter color.
     *
     * @default ```#1d1d1d```
     */
    counterColor: {
      type: String,
      required: false,
      default: '#1d1d1d',
    },

    /**
     * Property that defines the counter color when the text reach
     * the maximum length.
     *
     * @default ```#ff3333```
     */
    totalFillCounterColor: {
      type: String,
      required: false,
      default: '#ff3333',
    },

    /**
     * Property that defines the counter color when the text reach
     * 70% of the maximum length.
     *
     * @default ```#ffb833```
     */
    partialFillCounterColor: {
      type: String,
      required: false,
      default: '#ffb833',
    },

    /**
     * Property that defines an icon that stays behind the container.
     */
    prependIcon: {
      type: String,
      required: false,
    },

    /**
     * Property that defines what groups will be active in the editor.
     *
     * It may be combinated with 'options' property.
     *
     * The available groups are:
     * ```txt
     * • format
     * • align
     * • list
     * • embed
     * ```
     *
     * @example
     * ```html
     * <v-text-editor v-bind:groups="['format', 'list']" />
     * ```
     */
    groups: {
      type: Array,
      required: false,
      default: null,
      validator: (v: string[]): boolean =>
        typeof v === 'object' &&
        (v.length === 0 ||
          (!!v.length &&
            v.some((group) =>
              ['format', 'align', 'list', 'embed'].includes(group),
            ))),
    },

    /**
     * Property that defines what options will be active in the editor.
     *
     * It may be combinated with 'options' property.
     *
     * The available options are:
     * ```txt
     * • format:
     *   - bold
     *   - italic
     *   - underline
     *   - textColor
     * • align:
     *   - justifyLeft
     *   - justifyCenter
     *   - justifyRight
     *   - justifyFull
     * • list:
     *   - numberedList
     *   - bulletedList
     * • embed:
     *   - files
     *   - insertLink
     *   - removeLink
     * ```
     *
     * @example
     * ```html
     * <v-text-editor
     *   v-bind:options="
     *     {
     *       format: ['bold', 'textColor'],
     *       list: ['bulletedList'],
     *       embed: ['files']
     *     }
     *   "
     * />
     * ```
     */
    options: {
      type: Object,
      required: false,
      default: null,
      validator: (v: { [key: string]: string[] }): boolean =>
        Object.keys(v).some((optionKey) =>
          ['format', 'align', 'list', 'embed'].includes(optionKey),
        ),
    },
  },
  data() {
    return {
      /**
       * Property that defines the main container style.
       */
      style: {
        width: typeof this.width === 'string' ? this.width : this.width + 'px',
        height:
          typeof this.height === 'string' ? this.height : this.height + 'px',
        backgroundColor: this.bgColor,
      } as CSSStyleDeclaration,

      /**
       * Property that defines the header style.
       */
      headerStyle: {
        minHeight:
          typeof this.headerMinHeight === 'string'
            ? this.headerMinHeight
            : this.headerMinHeight + 'px',
      } as CSSStyleDeclaration,

      /**
       * Property that defines all the editor available options.
       */
      availableOptions: {
        format: ['bold', 'italic', 'underline', 'textColor'],
        align: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
        list: ['numberedList', 'bulletedList'],
        embed: ['files', 'insertLink', 'removeLink'],
      },

      /**
       * Property that defines the text editor base color.
       */
      baseTextColor: '',

      /**
       * Property that represents the editor HTML text.
       *
       * Its value changing may be listened by using the 'textChange'
       * event emittion.
       *
       * @example
       * ```html
       * <v-text-editor v-on:textChange="doSomething($event)" />
       * ```
       */
      text: '',

      /**
       * Property that represents the editor raw text, in which does not
       * contain any HTML tags.
       *
       * Its value changing may be listened by using the 'rawTextChange'
       * event emittion.
       *
       * @example
       * ```html
       * <v-text-editor v-on:rawTextChange="doSomething($event)" />
       * ```
       */
      rawText: '',

      /**
       * Property that defines whether the 'insert link' menu is open.
       */
      linkMenu: false,

      /**
       * Property that represents all the uploaded files.
       *
       * Its value changing may be listened by using the 'filesChange'
       * event emittion.
       *
       * Every time a file is uploaded or removed, an event is also
       * emitted: 'filesUpload' and 'fileRemove'.
       *
       * @example
       * ```html
       * <v-text-editor
       *   v-on:filesChange="updateFiles($event)"
       *   v-on:filesUpload="addFiles($event)"
       *   v-on:fileRemove="removeFile($event)"
       * />
       * ```
       */
      files: [] as File[],

      /**
       * Property that defines all keyboard safe keys when input
       * is locked.
       */
      safeKeys: [
        'ControlLeft',
        'ControlRight',
        'ShiftLeft',
        'ShiftRight',
        'AltLeft',
        'AltRight',
        'CapsLock',
        'Enter',
        'Escape',
        'Backspace',
        'Insert',
        'Delete',
        'Pause',
        'Numpad*',
        'Arrow',
      ],

      /**
       * Property that keeps a selection start and end.
       *
       * It may be changed using the 'saveSelection' method.
       */
      currentSelection: [0, 0, null] as (Node | number | null | undefined)[],

      /**
       * Property that represents whether the CTRL key is pressed.
       */
      isControlPressed: false,
    }
  },
  computed: {
    /**
     * Property that represents the length of the current text,
     * ignoring any line breaks.
     */
    textLength(): number {
      return this.rawText.replace(/\r?\n|\r/g, '').length
    },

    /**
     * Property that represents the filled percentage relative
     * to the current text and the max length.
     */
    filledPercentage(): number {
      return !this.maxLength ? 0 : (this.textLength / +this.maxLength) * 100
    },
  },
  methods: {
    /**
     * Returns whether the given group is active.
     *
     * @param group The group to be checked.
     * @returns Whether the group is active.
     */
    isGroupActive(group: string): boolean {
      return (
        (!this.groups && !this.options) ||
        (this.groups && this.groups.includes(group)) ||
        (this.options &&
          this.options[group] &&
          this.options[group].some((o: string) =>
            Object.values(this.availableOptions).join().split(',').includes(o),
          ))
      )
    },

    /**
     * Calculates the file size and adds its unit (B, KB, MB, GB).
     *
     * @param size The file size.
     * @returns A string containing the rounded size with its unit (B, KB, MB, GB).
     */
    _calculateFileSize(size: number): string {
      return calculateFileSize(size)
    },

    /**
     * Calculates the brightness of the given color (dark or bright).
     *
     * @param color The color in RGB or HEX format.
     * @returns A number that represents the color brightness (dark is <= 170 approximately)
     */
    _calculateColorBrightness(color: string): number {
      return calculateColorBrightness(color)
    },

    /**
     * Converts a RGBA color into the HEXA format.
     *
     * @param color The RGBA formatted color.
     * @returns An HEXA formatted color.
     *
     * @example
     * ```js
     * _rgba2hex('rgba(255, 0, 0, 1)') => '#FF0000FF'
     * ```
     */
    _rgba2hex(color: string): string {
      return rgba2hex(color)
    },

    /**
     * Removes a file from the files array.
     *
     * @param file The file to be removed.
     */
    removeFile(file: File): void {
      this.$emit('fileRemove', file)

      this.files = this.files.filter((f) => f.name !== file.name)

      const input = document.querySelector<HTMLInputElement>(
        '.v-text-editor__input',
      )

      if (input && input.files) {
        const dt = new DataTransfer()

        for (let i = 0; i < input.files.length; i++) {
          if (input.files[i].name !== file.name) {
            dt.items.add(input.files[i])
          }
        }

        input.files = dt.files
      }
    },

    /**
     * Sets and emits the embeded files.
     *
     * @param files An array of files to be attached.
     */
    onFileUpload(files: FileList): void {
      this.$emit('filesUpload', files)

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i) as File

        if (file && !this.files.map((f) => f.name).includes(file.name)) {
          this.files.push(file)
        }
      }
    },

    /**
     * Triggers when the text is modified by the user's keyboard.
     *
     * @param event The event triggered by the user.
     */
    onInput(event: InputEvent): void {
      const target = event.target as HTMLDivElement

      if (
        this.maxLength &&
        +this.maxLength < target.innerText.replace(/\r?\n|\r/g, '').length
      ) {
        return
      }

      this.text = target.innerHTML
      this.rawText = target.innerText
    },

    /**
     * Executes a command to format the text according to
     * the clicked button.
     *
     * @param value The command/option to be executed.
     */
    onOptionClick(value: string): void {
      document.execCommand(value)
    },

    /**
     * Saves the current selection to apply the link.
     */
    saveSelection(): void {
      const selection = document.getSelection()
      this.currentSelection = [
        selection?.anchorOffset,
        selection?.focusOffset,
        selection?.anchorNode,
      ]
    },

    /**
     * Adds a selection to the document based on the 'currentSelection'
     * property. Make sure to use the 'saveSelection' method before.
     *
     * @returns The created selection.
     */
    addSelection(): Selection | null {
      const selection = document.getSelection()
      selection?.removeAllRanges()

      const range = document.createRange()
      range.setStart(
        this.currentSelection[2] as Node,
        this.currentSelection[0] as number,
      )
      range.setEnd(
        this.currentSelection[2] as Node,
        this.currentSelection[1] as number,
      )

      selection?.addRange(range)

      return selection
    },

    /**
     * Inserts a link to the selected text.
     *
     * @param link The link to be inserted.
     */
    insertLink(link: string): void {
      const selection = this.addSelection()

      document.execCommand('createLink', false, link)

      if (selection && selection.anchorNode) {
        ;(
          (selection.anchorNode as Node).parentElement as HTMLAnchorElement
        ).target = '_blank'
      }

      this.currentSelection = [0, 0, null]
    },

    /**
     * Removes the hyperlink from the selected text.
     */
    removeLink(): void {
      document.execCommand('unlink')
    },

    /**
     * Sets the color of the selected text.
     *
     * @param color The color to be set.
     */
    setColor(color: string): void {
      this.addSelection()

      document.execCommand('foreColor', false, color.substr(0, 7))

      this.currentSelection = [0, 0, null]
    },
  },
  mounted() {
    this.baseTextColor =
      this._calculateColorBrightness(this.bgColor) <= 170
        ? '#ffffff'
        : '#0d0d0d'

    const textarea = document.querySelector<HTMLDivElement>(
      '.v-text-editor__textarea',
    )

    if (textarea) {
      textarea.style.caretColor = this.accentColor
      textarea.innerHTML = this.value
      this.text = this.value
      this.rawText = textarea.innerText

      textarea.addEventListener('keyup', (e) => {
        if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
          this.isControlPressed = false
        }
      })

      textarea.addEventListener('keydown', (e) => {
        if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
          this.isControlPressed = true
        }

        if (e.code === 'Tab') {
          e.preventDefault()
          if (this.maxLength && +this.maxLength - this.textLength > 0) {
            let spaces = ''
            const amount =
              +this.maxLength - this.textLength > 4
                ? 4
                : +this.maxLength - this.textLength

            for (let i = 0; i < amount; i++) {
              spaces += '&nbsp;'
            }

            document.execCommand('insertHTML', false, spaces)
          }
        }
      })
    }
  },
  watch: {
    text(value: string) {
      this.$emit('textChange', value)
    },
    rawText(value: string) {
      this.$emit('rawTextChange', value)
    },
    files(value: File[]) {
      this.$emit('filesChange', value)
    },
    linkMenu(value: boolean) {
      if (!value) {
        this.currentSelection = [0, 0]
      }
    },
  },
})
</script>

<style scope>
.v-text-editor {
  display: flex;
}

.v-text-editor__prepend-icon {
  margin-right: 9px;
  margin-top: 4px;
}

.v-text-editor__container {
  display: flex;
  flex-direction: column;

  min-width: 260px;
}

.v-text-editor__textarea {
  display: inline-block;
  flex: 1;

  overflow-y: auto !important;
  border: none;
  outline: none;
}

.v-text-editor__textarea li {
  overflow: visible !important;
}

.v-text-editor__textarea * {
  font-family: 'Roboto', sans-serif !important;
  background: transparent !important;
}

.v-text-editor__textarea[placeholder]:empty:before {
  content: attr(placeholder);
  color: #555;

  pointer-events: none;

  transition: opacity 0.1s;
}

.v-text-editor__textarea[placeholder]:empty:focus:before {
  opacity: 0;
}

.v-text-editor__details {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  width: 100%;
  height: auto;
}

.v-text-editor__counter {
  margin-left: auto;

  font-size: 0.85rem;
}

.v-text-editor__textarea .v-input__control {
  height: 100%;
}

.v-text-editor__textarea .v-input__slot {
  height: calc(100% - 30px);
}

.v-text-editor__textarea .v-input__slot::after {
  display: none !important;
}

.v-text-editor__textarea .v-text-field__details {
  height: 14px;
  flex: 0;
}

.v-text-editor__container .v-chip .v-chip__content {
  overflow: visible !important;
}

.v-text-editor__link .v-input__control .v-text-field__details {
  display: none;
}

.v-text-editor__link .v-input__slot {
  margin-bottom: 0;
}

.v-text-editor__container.v-text-editor__outlined {
  border: 1px solid;
  background-color: transparent !important;
}
</style>
