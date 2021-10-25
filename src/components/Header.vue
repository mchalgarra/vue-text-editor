<template>
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
            <v-icon :color="isOptionSelected('bold') ? accentColor : iconColor"
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
              :color="isOptionSelected('underline') ? accentColor : iconColor"
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
          <template v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }">
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
          :dark="_calculateColorBrightness(accentColor) <= 170"
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
              :color="isOptionSelected('justifyLeft') ? accentColor : iconColor"
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
              :color="isOptionSelected('justifyFull') ? accentColor : iconColor"
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
          <template v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }">
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
        autofocus
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
</template>

<script lang="ts">
import Vue from 'vue'
import { calculateColorBrightness, rgba2hex } from '../utils/color'

type JustifyType =
  | 'justifyLeft'
  | 'justifyRight'
  | 'justifyCenter'
  | 'justifyFull'

export default Vue.extend({
  name: 'Header',
  props: {
    /**
     * Property that defines the header style.
     *
     * @type {CSSStyleDeclaration}
     */
    headerStyle: {
      type: Object,
      required: true,
    },

    /**
     * Property that defines the editor background color.
     */
    bgColor: {
      type: String,
      required: true,
    },

    /**
     * Property that defines the header height.
     */
    headerMinHeight: {
      type: [Number, String],
      required: true,
      validator: (v): boolean => typeof v !== 'number' || v >= 0,
    },

    /**
     * Property that defines the header inactive icons color.
     */
    iconColor: {
      type: String,
      required: true,
    },

    /**
     * Property that defines the editor accent color.
     */
    accentColor: {
      type: String,
      required: false,
    },

    /**
     * Property that defines whether the component is outlined.
     */
    outlined: Boolean,

    // /**
    //  * Property that defines all the editor available groups.
    //  */
    // availableGroups: {
    //   type: Array,
    //   required: true,
    //   default: () => [] as string[],
    //   validator: (v) => v && !!v.length && typeof v[0] === 'string',
    // },

    // /**
    //  * Property that defines all the editor available options.
    //  */
    // availableOptions: {
    //   type: Object,
    //   required: true,
    //   default: () => ({} as { [key: string]: string[] }),
    //   validator: (v: { [key: string]: string[] }): boolean =>
    //     Object.keys(v).some((optionKey) =>
    //       ['format', 'align', 'list', 'embed'].includes(optionKey),
    //     ),
    // },

    // /**
    //  * Property that defines all possible formatting options.
    //  */
    // possibleFormats: {
    //   type: Array,
    //   required: true,
    //   default: () => [] as string[],
    //   validator: (v) => v && !!v.length && typeof v[0] === 'string',
    // },

    // /**
    //  * Property that defines all possible align options.
    //  */
    // possibleAligns: {
    //   type: Array,
    //   required: true,
    //   default: () => [] as JustifyType[],
    //   validator: (v) => v && !!v.length && typeof v[0] === 'string',
    // },

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
      validator: (v: string[]): boolean =>
        !v ||
        (typeof v === 'object' &&
          (v.length === 0 ||
            (!!v.length &&
              v.some((group) =>
                ['format', 'align', 'list', 'embed'].includes(group),
              )))),
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
      validator: (v: { [key: string]: string[] }): boolean =>
        !v ||
        Object.keys(v).some((optionKey) =>
          ['format', 'align', 'list', 'embed'].includes(optionKey),
        ),
    },
  },
  data() {
    return {
      /**
       * Property that represents the selected formatting options.
       */
      formatOptions: [] as string[],

      /**
       * Property that represents the selected align option.
       */
      alignOption: 'justifyLeft' as JustifyType,

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
      ] as JustifyType[],

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
      color: '',

      /**
       * Property that defines the text current color (HEX).
       *
       * Its default value is calculated based on the brightness
       * level of the editor background color.
       */
      textColor: '',

      /**
       * Property that represents the URL present in the URL text field.
       */
      url: '',

      /**
       * Property that defines whether the 'insert link' menu is open.
       */
      linkMenu: false,
    }
  },
  methods: {
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
     * Emits to the parent that an option was clicked.
     *
     * @param option The command/option to be executed.
     */
    onOptionClick(option: string): void {
      this.$emit('optionClick', option)
    },

    /**
     * Returns whether the given property is selected.
     *
     * @param value The option value.
     * @returns Whether the option is selected.
     */
    isOptionSelected(value: string): boolean {
      return (
        (this.formatOptions && this.formatOptions.includes(value)) ||
        this.alignOption === value
      )
    },

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
     * Returns whether the given option is active.
     *
     * @param option The option to be checked.
     * @returns Whether the option is active.
     */
    isOptionActive(option: string): boolean {
      const entry: [string, string[]] | undefined = Object.entries(
        this.availableOptions,
      ).find((avOp) => avOp[1].includes(option))

      return (
        !this.options ||
        Object.values(this.options).join().split(',').includes(option) ||
        (!!entry && this.groups && this.groups.includes(entry[0]))
      )
    },

    /**
     * Returns whether the divider from some group is active.
     *
     * @param group The group to be checked.
     * @returns Whether the divider is active.
     */
    isDividerActive(group: string): boolean {
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
     * Emits to the parent that a color was picked.
     *
     * @param color The color to be set.
     */
    setColor(color: string): void {
      this.$emit('setColor', color)
      this.textColor = color.substr(0, 7)
    },

    /**
     * Opens the browser file selection tool.
     */
    uploadFile(): void {
      ;(this.$refs?.uploader as HTMLInputElement)?.click()
    },

    /**
     * Emits to the parent all uploaded files.
     *
     * @param files An array of files to be attached.
     */
    onFileUpload(files: FileList): void {
      this.$emit('fileUpload', files)
    },

    /**
     * Emits to the parent that a link was inserted.
     *
     * @param link The link to be inserted.
     */
    insertLink(link: string): void {
      this.$emit('insertLink', link)

      this.linkMenu = false
      this.url = ''
    },

    /**
     * Emits to the parent that a link was removed.
     */
    removeLink(): void {
      this.$emit('removeLink')
    },

    /**
     * Emits to the parent an event to save the current
     * selection.
     */
    saveSelection(): void {
      this.$emit('saveSelection')
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
     * Updates the header buttons status according to the text
     * state in some specific position.
     */
    updateOptions(): void {
      this.$emit('updateOptions')

      const foreColor = document.queryCommandValue('foreColor')
      this.color = this._rgba2hex(foreColor).substr(0, 7)

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
    this.color =
      this._calculateColorBrightness(this.bgColor) <= 170
        ? '#ffffff'
        : '#0d0d0d'

    this.textColor =
      this._calculateColorBrightness(this.bgColor) <= 170
        ? '#ffffff'
        : '#0d0d0d'

    const textarea = document.querySelector<HTMLDivElement>(
      '.v-text-editor__textarea',
    )

    if (textarea) {
      textarea.addEventListener('mouseup', () => {
        this.updateOptions()
      })

      textarea.addEventListener('keyup', () => {
        this.updateOptions()
      })
    }
  },
  watch: {
    linkMenu(value: boolean) {
      this.$emit('linkMenuChange', value)

      if (value) {
        this.color = this.textColor
      }
    },
  },
})
</script>

<style scoped>
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
</style>
