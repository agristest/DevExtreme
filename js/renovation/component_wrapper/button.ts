/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line import/named
import { dxElementWrapper } from '../../core/renderer';
import ValidationEngine from '../../ui/validation_engine';
import Component from './common/component';
import type { Button } from '../ui/button';

export default class ButtonWrapper extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get _validationGroupConfig(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ValidationEngine.getGroupConfig(this._findGroup());
  }

  getDefaultTemplateNames(): string[] {
    return ['content'];
  }

  getProps(): Record<string, unknown> {
    const props = super.getProps();
    props.validationGroup = this._validationGroupConfig;
    return props;
  }

  get _templatesInfo(): Record<string, string> {
    return { template: 'content' };
  }

  _toggleActiveState(_: HTMLElement, value: boolean): void {
    const button = this.viewRef as Button;
    value ? button.activate() : button.deactivate();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getSubmitAction(): any {
    let needValidate = true;
    let validationStatus = 'valid';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any)._createAction(({ event, submitInput }) => {
      if (needValidate) {
        const validationGroup = this._validationGroupConfig;

        if (validationGroup !== undefined && validationGroup !== '') {
          const { status, complete } = validationGroup.validate();

          validationStatus = status;

          if (status === 'pending') {
            needValidate = false;
            this.option('disabled', true);

            complete.then(() => {
              needValidate = true;
              this.option('disabled', false);

              validationStatus = status;
              validationStatus === 'valid' && submitInput.click();
            });
          }
        }
      }

      validationStatus !== 'valid' && event.preventDefault();
      event.stopPropagation();
    });
  }

  _init(): void {
    super._init();
    this.defaultKeyHandlers = {
      enter: (_, opts): Event | undefined => (this.viewRef as Button).onWidgetKeyDown(opts),
      space: (_, opts): Event | undefined => (this.viewRef as Button).onWidgetKeyDown(opts),
    };
    this._addAction('onSubmit', this._getSubmitAction());
  }

  _initMarkup(): void {
    super._initMarkup();

    const $content = (this.$element() as unknown as dxElementWrapper).find('.dx-button-content');
    const $template = $content.children().filter('.dx-template-wrapper');

    if ($template.length) {
      $template.addClass('dx-button-content');
      $content.replaceWith($template);
    }
  }

  _patchOptionValues(options: Record<string, unknown>): Record<string, unknown> {
    return super._patchOptionValues({ ...options, templateData: options._templateData });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _findGroup(): any {
    const $element = this.$element();
    const validationGroup = this.option('validationGroup');
    return validationGroup !== undefined && validationGroup !== ''
      ? validationGroup
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (ValidationEngine as any).findGroup($element, (this as any)._modelByElement($element));
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
