<template>
  <div class="v-text-editor">
    <div v-if="prependIcon" class="v-text-editor__prepend-icon">
      <v-icon>{{ prependIcon }}</v-icon>
    </div>
    <div
      class="v-text-editor__container"
      :class="className + ' ' + (outlined && 'v-text-editor__outlined')"
      :style="{ ...style, minWidth: '280px', borderColor }"
    >
      <div class="v-text-editor__header" :style="{ ...headerStyle }">
        <v-btn-toggle
          v-if="isGroupActive('format')"
          v-model="formatOptions"
          multiple
          dense
          borderless
          :background-color="outlined ? 'transparent' : bgColor"
          :color="accentColor"
        >
          <v-tooltip top v-if="isOptionActive('bold')">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                value="bold"
                icon
                v-on="on"
                v-bind="attrs"
                @click="onOptionClick('bold')"
              >
                <v-icon
                  :color="isOptionSelected('bold') ? accentColor : iconColor"
                  >mdi-format-bold</v-icon
                >
              </v-btn>
            </template>
            <span>Bold</span>
          </v-tooltip>

          <v-tooltip top v-if="isOptionActive('italic')">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                value="italic"
                icon
                v-on="on"
                v-bind="attrs"
                @click="onOptionClick('italic')"
              >
                <v-icon
                  :color="isOptionSelected('italic') ? accentColor : iconColor"
                  >mdi-format-italic</v-icon
                >
              </v-btn>
            </template>
            <span>Italic</span>
          </v-tooltip>

          <v-tooltip top v-if="isOptionActive('underline')">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                value="underline"
                icon
                v-on="on"
                v-bind="attrs"
                @click="onOptionClick('underline')"
              >
                <v-icon
                  :color="
                    isOptionSelected('underline') ? accentColor : iconColor
                  "
                  >mdi-format-underline</v-icon
                >
              </v-btn>
            </template>
            <span>Underline</span>
          </v-tooltip>
        </v-btn-toggle>

        <v-menu
          v-if="isGroupActive('format') && isOptionActive('textColor')"
          v-model="colorMenu"
          offset-y
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-tooltip top>
              <template
                v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
              >
                <v-btn
                  text
                  style="min-width: unset"
                  class="px-2"
                  :color="accentColor"
                  v-on="{ ...on, ...tooltipOn }"
                  v-bind="{ ...attrs, ...tooltipAttrs }"
                  @click="saveSelection"
                >
                  <div>
                    <v-icon :color="iconColor">mdi-format-color-text</v-icon>

                    <v-sheet
                      rounded
                      style="margin-top: -4px"
                      height="4"
                      width="26"
                      :color="color"
                    ></v-sheet>
                  </div>
                </v-btn>
              </template>
              <span>Text Color</span>
            </v-tooltip>
          </template>

          <v-color-picker
            v-model="color"
            dot-size="14"
            hide-mode-switch
          ></v-color-picker>

          <v-row align="center" justify="center" class="mb-4 mt-2">
            <v-btn
              :color="accentColor"
              :dark="calculateColorBrightness(accentColor) <= 170"
              @click="
                setColor(color)
                colorMenu = false
              "
            >
              SAVE
            </v-btn>
          </v-row>
        </v-menu>

        <v-divider
          v-if="isDividerActive('format')"
          vertical
          style="min-height: 36px"
        ></v-divider>

        <v-btn-toggle
          v-if="isGroupActive('align')"
          v-model="alignOption"
          mandatory
          dense
          borderless
          :background-color="outlined ? 'transparent' : bgColor"
          :color="accentColor"
        >
          <v-tooltip top v-if="isOptionActive('justifyLeft')">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                value="justifyLeft"
                icon
                v-on="on"
                v-bind="attrs"
                @click="onOptionClick('justifyLeft')"
              >
                <v-icon
                  :color="
                    isOptionSelected('justifyLeft') ? accentColor : iconColor
                  "
                  >mdi-format-align-left</v-icon
                >
              </v-btn>
            </template>
            <span>Align Left</span>
          </v-tooltip>

          <v-tooltip top v-if="isOptionActive('justifyCenter')">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                value="justifyCenter"
                icon
                v-on="on"
                v-bind="attrs"
                @click="onOptionClick('justifyCenter')"
              >
                <v-icon
                  :color="
                    isOptionSelected('justifyCenter') ? accentColor : iconColor
                  "
                  >mdi-format-align-center</v-icon
                >
              </v-btn>
            </template>
            <span>Align Center</span>
          </v-tooltip>

          <v-tooltip top v-if="isOptionActive('justifyRight')">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                value="justifyRight"
                icon
                v-on="on"
                v-bind="attrs"
                @click="onOptionClick('justifyRight')"
              >
                <v-icon
                  :color="
                    isOptionSelected('justifyRight') ? accentColor : iconColor
                  "
                  >mdi-format-align-right</v-icon
                >
              </v-btn>
            </template>
            <span>Align Right</span>
          </v-tooltip>

          <v-tooltip top v-if="isOptionActive('justifyFull')">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                value="justifyFull"
                icon
                v-on="on"
                v-bind="attrs"
                @click="onOptionClick('justifyFull')"
              >
                <v-icon
                  :color="
                    isOptionSelected('justifyFull') ? accentColor : iconColor
                  "
                  >mdi-format-align-justify</v-icon
                >
              </v-btn>
            </template>
            <span>Justify</span>
          </v-tooltip>
        </v-btn-toggle>

        <v-divider
          v-if="isDividerActive('align')"
          vertical
          style="min-height: 36px"
        ></v-divider>

        <v-tooltip
          top
          v-if="isGroupActive('list') && isOptionActive('numberedList')"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              style="min-width: unset"
              class="px-2"
              v-on="on"
              v-bind="attrs"
              :color="accentColor"
              @click="onOptionClick('insertorderedlist')"
            >
              <v-icon :color="iconColor">mdi-format-list-numbered</v-icon>
            </v-btn>
          </template>
          <span>Numbered List</span>
        </v-tooltip>

        <v-tooltip
          top
          v-if="isGroupActive('list') && isOptionActive('bulletedList')"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              style="min-width: unset"
              class="px-2"
              v-on="on"
              v-bind="attrs"
              :color="accentColor"
              @click="onOptionClick('insertUnorderedList')"
            >
              <v-icon :color="iconColor">mdi-format-list-bulleted</v-icon>
            </v-btn>
          </template>
          <span>Bulleted List</span>
        </v-tooltip>

        <v-divider
          v-if="isDividerActive('list')"
          vertical
          style="min-height: 36px"
        ></v-divider>

        <v-tooltip top v-if="isGroupActive('embed') && isOptionActive('files')">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              style="min-width: unset"
              class="px-2"
              v-on="on"
              v-bind="attrs"
              :color="accentColor"
              @click="uploadFile"
            >
              <v-icon :color="iconColor">mdi-paperclip</v-icon>
            </v-btn>
          </template>
          <span>Upload File</span>
        </v-tooltip>

        <input
          v-if="isGroupActive('embed') && isOptionActive('files')"
          ref="uploader"
          class="v-text-editor__input d-none"
          type="file"
          multiple
          @change="(e) => onFileUpload(e.target.files)"
        />

        <v-menu
          v-if="isGroupActive('embed') && isOptionActive('insertLink')"
          v-model="linkMenu"
          offset-y
          :close-on-content-click="false"
          min-width="40%"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-tooltip top>
              <template
                v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }"
              >
                <v-btn
                  text
                  style="min-width: unset"
                  class="px-2"
                  v-on="{ ...on, ...tooltipOn }"
                  v-bind="{ ...attrs, ...tooltipAttrs }"
                  :color="accentColor"
                  @click="saveSelection"
                >
                  <v-icon :color="iconColor">mdi-link-variant</v-icon>
                </v-btn>
              </template>
              <span>Insert Link</span>
            </v-tooltip>
          </template>

          <v-text-field
            v-model="url"
            class="v-text-editor__link ma-0 pa-0"
            clearable
            solo
            :color="accentColor"
            @keydown="
              (e) => {
                if (e.code === 'Enter') {
                  e.preventDefault()
                  insertLink(url)
                }
              }
            "
          ></v-text-field>
        </v-menu>

        <v-tooltip
          top
          v-if="isGroupActive('embed') && isOptionActive('removeLink')"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              style="min-width: unset"
              class="px-2"
              v-on="on"
              v-bind="attrs"
              :color="accentColor"
              @click="removeLink"
            >
              <v-icon :color="iconColor">mdi-link-variant-off</v-icon>
            </v-btn>
          </template>
          <span>Remove Link</span>
        </v-tooltip>
      </div>

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
            calculateColorBrightness(accentColor) <= 170 ? 'white' : 'black'
          "
          @click:close="removeFile(file, index)"
        >
          {{ file.name }} ({{ calculateFileSize(file.size) }})
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
              maxLength <= e.target.innerText.replace(/\r?\n|\r/g, '').length &&
              !safeKeys.filter((key) => e.code.includes(key.replace('*', '')))
                .length
            ) {
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
              filledPercentage === 100
                ? totalFillCounterColor
                : filledPercentage >= 70
                ? partialFillCounterColor
                : counterColor === '#1d1d1d' &&
                  calculateColorBrightness(bgColor) <= 170
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

<script>
export default {
  name: 'VueTextEditor',
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
     * The min width is 280px.
     *
     * @default ```100%```
     */
    width: {
      type: [Number, String],
      required: false,
      default: '100%',
      validator: (v) => typeof v !== 'number' || v >= 0,
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
      validator: (v) => typeof v !== 'number' || v >= 0,
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
      validator: (v) => typeof v !== 'number' || v >= 0,
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
      validator: (v) =>
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
      validator: (v) =>
        typeof v === 'object' &&
        (v.length === 0 ||
          (v.length &&
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
      validator: (v) =>
        Object.keys(v).some((optionKey) =>
          ['format', 'align', 'list', 'embed'].includes(optionKey),
        ),
    },
  },
  data() {
    return {
      /**
       * Property that defines the main container style.
       *
       * @type {CSSStyleDeclaration}
       */
      style: {
        width: typeof this.width === 'string' ? this.width : this.width + 'px',
        height:
          typeof this.height === 'string' ? this.height : this.height + 'px',
        backgroundColor: this.bgColor,
      },

      /**
       * Property that defines the header style.
       *
       * @type {CSSStyleDeclaration}
       */
      headerStyle: {
        minHeight:
          typeof this.headerMinHeight === 'string'
            ? this.heightMinHeight
            : this.headerMinHeight + 'px',
      },

      /**
       * Property that represents the selected formatting options.
       *
       * @type {string[]}
       */
      formatOptions: [],

      /**
       * Property that represents the selected align option.
       *
       * @type {'justifyLeft' | 'justifyRight' | 'justifyCenter' | 'justifyFull'}
       */
      alignOption: 'justifyLeft',

      /**
       * Property that defines all possible formatting options.
       */
      possibleFormats: ['bold', 'italic', 'underline'],

      /**
       * Property that defines all possible align options.
       */
      possibleAligns: [
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
      ],

      /**
       * Property that defines all the editor available groups.
       */
      availableGroups: ['format', 'align', 'list', 'embed'],

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
       * Property that defines whether the color picker menu is open.
       */
      colorMenu: false,

      /**
       * Property that defines the color picker current HEX.
       *
       * Its default value is calculated based on the brightness
       * level of the editor background color.
       */
      color:
        this.calculateColorBrightness(this.bgColor) <= 170
          ? '#ffffff'
          : '#0d0d0d',

      /**
       * Property that defines the text current color (HEX).
       *
       * Its default value is calculated based on the brightness
       * level of the editor background color.
       */
      textColor:
        this.calculateColorBrightness(this.bgColor) <= 170
          ? '#ffffff'
          : '#0d0d0d',

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
       * Property that represents the URL present in the URL text field.
       */
      url: '',

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
       *
       * @type {File[]}
       */
      files: [],

      /**
       * Property that defines all keyboard safe keys when input
       * is locked.
       */
      safeKeys: [
        'Space',
        'ControlLeft',
        'ControlRight',
        'ShiftLeft',
        'ShiftRight',
        'AltLeft',
        'AltRight',
        'CapsLock',
        'Tab',
        'Enter',
        'Escape',
        'Backspace',
        'Insert',
        'Delete',
        'Pause',
        'Numpad*',
      ],

      /**
       * Property that keeps a selection start and end.
       *
       * It may be changed using the 'saveSelection' method.
       */
      currentSelection: [0, 0, null],
    }
  },
  computed: {
    /**
     * Property that represents the length of the current text,
     * ignoring any line breaks.
     */
    textLength() {
      return this.rawText.replace(/\r?\n|\r/g, '').length
    },

    /**
     * Property that represents the filled percentage relative
     * to the current text and the max length.
     */
    filledPercentage() {
      return !this.maxLength ? 0 : (this.textLength / this.maxLength) * 100
    },
  },
  methods: {
    /**
     * Returns whether the given property is selected.
     *
     * @param {string} value The option value.
     * @returns Whether the option is selected.
     */
    isOptionSelected(value) {
      return (
        (this.formatOptions && this.formatOptions.includes(value)) ||
        this.alignOption === value
      )
    },

    /**
     * Returns whether the given group is active.
     *
     * @param {string} group The group to be checked.
     * @returns {boolean} Whether the group is active.
     */
    isGroupActive(group) {
      return (
        (!this.groups && !this.options) ||
        (this.groups && this.groups.includes(group)) ||
        (this.options &&
          this.options[group] &&
          this.options[group].some((o) =>
            Object.values(this.availableOptions).join().split(',').includes(o),
          ))
      )
    },

    /**
     * Returns whether the given option is active.
     *
     * @param {string} option The option to be checked.
     * @returns {boolean} Whether the option is active.
     */
    isOptionActive(option) {
      return (
        !this.options ||
        Object.values(this.options).join().split(',').includes(option) ||
        (this.groups &&
          this.groups.includes(
            Object.entries(this.availableOptions).find((avOp) =>
              avOp[1].includes(option),
            )[0],
          ))
      )
    },

    /**
     * Returns whether the divider from some group is active.
     *
     * @param {string} group The group to be checked.
     * @returns {boolean} Whether the divider is active.
     */
    isDividerActive(group) {
      const index = this.availableGroups.indexOf(group)

      if (index === -1) {
        return false
      }

      return (
        this.isGroupActive(group) &&
        this.availableGroups
          .slice(index + 1, this.availableGroups.length)
          .map((gp) => this.isGroupActive(gp))
          .reduce((previous, current) => current || previous, false)
      )
    },

    /**
     * Calculates the file size and adds its unit (B, KB, MB, GB).
     *
     * @param {number} size The file size.
     * @returns {string} A string containing the rounded size with its unit (B, KB, MB, GB).
     */
    calculateFileSize(size) {
      if (size < 1024) {
        return size + ' B'
      } else if (size < 1048576) {
        return (size / 1024).toFixed(2) + ' KB'
      } else if (size < 1073741824) {
        return (size / 1048576).toFixed(2) + ' MB'
      } else {
        return (size / 1073741824).toFixed(2) + ' GB'
      }
    },

    /**
     * Calculates the brightness of the given color (dark or bright).
     *
     * @param {string} color The color in RGB or HEX format.
     * @returns {number} A number that represents the color brightness (dark is <= 170 approximately)
     */
    calculateColorBrightness(color) {
      let r, g, b

      if (color.match(/^rgb/)) {
        color = color.match(
          /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/,
        )

        r = color[1]
        g = color[2]
        b = color[3]
      } else {
        color = +(
          '0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&')
        )

        r = color >> 16
        g = (color >> 8) & 255
        b = color & 255
      }

      const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

      return hsp
    },

    /**
     * Converts a RGBA color into the HEXA format.
     *
     * @param {string} color The RGBA formatted color.
     * @returns {string} An HEXA formatted color.
     *
     * @example
     * ```js
     * rgba2hex('rgba(255, 0, 0, 1)') => '#FF0000FF'
     * ```
     */
    rgba2hex(color) {
      let a
      const rgb = color
        .replace(/\s/g, '')
        .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
      const alpha = ((rgb && rgb[4]) || '').trim()
      let hex = rgb
        ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
          (rgb[2] | (1 << 8)).toString(16).slice(1) +
          (rgb[3] | (1 << 8)).toString(16).slice(1)
        : color

      if (alpha !== '') {
        a = alpha
      } else {
        a = 1
      }
      // multiply before convert to HEX
      a = ((a * 255) | (1 << 8)).toString(16).slice(1)
      hex = hex + a

      return '#' + hex
    },

    /**
     * Opens the browser file selection tool.
     */
    uploadFile() {
      this.$refs.uploader.click()
    },

    /**
     * Removes a file from the files array.
     *
     * @param {File} file The file to be removed.
     */
    removeFile(file) {
      this.$emit('fileRemove', file)

      this.files = this.files.filter((f) => f.name !== file.name)

      const input = document.querySelector('.v-text-editor__input')

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
     * @param {FileList} files An array of files to be attached.
     */
    onFileUpload(files) {
      this.$emit('filesUpload', files)

      for (let i = 0; i < files.length; i++) {
        this.files.push(files.item(i))
      }
    },

    /**
     * Triggers when the text is modified by the user's keyboard.
     *
     * @param {InputEvent} event The event triggered by the user.
     */
    onInput(event) {
      if (
        this.maxLength &&
        this.maxLength < event.target.innerText.replace(/\r?\n|\r/g, '').length
      ) {
        return
      }

      this.text = event.target.innerHTML
      this.rawText = event.target.innerText
    },

    /**
     * Executes a command to format the text according to
     * the clicked button.
     *
     * @param {string} value The command/option to be executed.
     */
    onOptionClick(value) {
      document.execCommand(value)

      if (this.formatOptions.includes(value)) {
        this.formatOptions = this.formatOptions.filter(
          (option) => option !== value,
        )
      }
    },

    /**
     * Saves the current selection to apply the link.
     */
    saveSelection() {
      const selection = document.getSelection()
      this.currentSelection = [
        selection.baseOffset,
        selection.focusOffset,
        selection.anchorNode,
      ]
    },

    /**
     * Adds a selection to the document based on the 'currentSelection'
     * property. Make sure to use the 'saveSelection' method before.
     *
     * @returns {Selection} The created selection.
     */
    addSelection() {
      const selection = document.getSelection()
      selection.removeAllRanges()

      const range = document.createRange()
      range.setStart(this.currentSelection[2], this.currentSelection[0])
      range.setEnd(this.currentSelection[2], this.currentSelection[1])

      selection.addRange(range)

      return selection
    },

    /**
     * Inserts a link to the selected text.
     *
     * @param {string} link The link to be inserted.
     */
    insertLink(link) {
      this.linkMenu = false

      const selection = this.addSelection()

      document.execCommand('createLink', false, link)
      selection.anchorNode.parentElement.target = '_blank'

      this.currentSelection = [0, 0, null]
      this.url = ''
    },

    /**
     * Removes the hyperlink from the selected text.
     */
    removeLink() {
      document.execCommand('unlink')
    },

    /**
     * Sets the color of the selected text.
     *
     * @param {string} color The color to be set.
     */
    setColor(color) {
      this.addSelection()

      this.textColor = color.substr(0, 7)
      document.execCommand('foreColor', false, color.substr(0, 7))

      this.currentSelection = [0, 0, null]
    },

    /**
     * Updates the header buttons status according to the text
     * state in some specific position.
     */
    updateOptions() {
      const foreColor = document.queryCommandValue('foreColor')
      this.color = this.rgba2hex(foreColor).substr(0, 7)

      this.possibleFormats.forEach((option) => {
        if (
          document.queryCommandState(option) &&
          !this.formatOptions.includes(option)
        ) {
          this.formatOptions.push(option)
        } else if (!document.queryCommandState(option)) {
          this.formatOptions = this.formatOptions.filter(
            (format) => format !== option,
          )
        }
      })

      this.possibleAligns.forEach((align) => {
        if (document.queryCommandState(align)) {
          this.alignOption = align
        }
      })
    },
  },
  mounted() {
    this.baseTextColor = this.color

    const textarea = document.querySelector('.v-text-editor__textarea')

    if (textarea) {
      textarea.style.caretColor = this.accentColor
      textarea.innerHTML = this.value
      this.text = this.value
      this.rawText = textarea.innerText

      textarea.addEventListener('mouseup', () => {
        this.updateOptions()
      })

      textarea.addEventListener('keyup', () => {
        this.updateOptions()
      })

      textarea.addEventListener('keydown', (e) => {
        if (e.code === 'Tab') {
          e.preventDefault()
          document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
        }
      })
    }
  },
  watch: {
    text(value) {
      this.$emit('textChange', value)
    },
    rawText(value) {
      this.$emit('rawTextChange', value)
    },
    files(value) {
      this.$emit('filesChange', value)
    },
    linkMenu(value) {
      if (!value) {
        this.currentSelection = [0, 0]
      } else {
        this.color = this.textColor
      }
    },
  },
}
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
}

.v-text-editor__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  width: 100%;

  padding: 0.6rem;

  overflow: visible !important;
  border-radius: 5px;
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

.v-text-editor__textarea[placeholder]:empty:before {
  content: attr(placeholder);
  color: #555;

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
