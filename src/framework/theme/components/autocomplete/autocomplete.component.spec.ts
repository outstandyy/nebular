import {Component, EventEmitter, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NbOverlayContainerAdapter} from '@nebular/theme/components/cdk/adapter/overlay-container-adapter';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NbThemeModule} from '@nebular/theme/theme.module';
import {NbLayoutModule} from '@nebular/theme/components/layout/layout.module';
import {NB_DOCUMENT} from '@nebular/theme/theme.options';
import {By} from '@angular/platform-browser';
import {NbAutocompleteDirective} from '@nebular/theme/components/autocomplete/autocomplete.directive';
import {NbAutocompleteModule} from '@nebular/theme/components/autocomplete/autocomplete.module';
import {NbOptionComponent} from '@nebular/theme/components/option-list/option.component';
import {NbOptionListModule} from '@nebular/theme/components/option-list/option-list.module';
import {NbAutocompleteComponent} from '@nebular/theme/components/autocomplete/autocomplete.component';

const TEST_GROUPS = [
  {
    title: 'Group 1',
    options: [
      { title: 'Option 1', value: 'Option 1' },
      { title: 'Option 2', value: 'Option 2' },
      { title: 'Option 3', value: 'Option 3' },
    ],
  },
  {
    title: 'Group 2',
    options: [
      { title: 'Option 21', value: 'Option 21' },
      { title: 'Option 22', value: 'Option 22' },
      { title: 'Option 23', value: 'Option 23' },
    ],
  },
  {
    title: 'Group 3',
    options: [
      { title: 'Option 31', value: 'Option 31' },
      { title: 'Option 32', value: 'Option 32' },
      { title: 'Option 33', value: 'Option 33' },
    ],
  },
];

@Component({
  selector: 'nb-autocomplete-test',
  template: `
    <nb-layout>
      <nb-layout-column>

        <input #autoInput
               nbInput
               type="text"
               (input)="onChange($event)"
               placeholder="This is test autocomplete component"
               [nbAutocomplete]="auto" />

        <nb-autocomplete #auto (selectedChange)="selectedChange.emit($event)" [handleDisplayFn]="handleFunction">

          <nb-option-group *ngFor="let group of filteredGroups" [title]="group.title">
            <nb-option *ngFor="let option of group.options" [value]="option.value">
              {{ option.title }}
            </nb-option>
          </nb-option-group>

        </nb-autocomplete>

      </nb-layout-column>
    </nb-layout>
  `,
})
export class NbAutocompleteTestComponent {

  @Output() selectedChange: EventEmitter<any> = new EventEmitter();
  @ViewChild(NbAutocompleteDirective, { static: true }) autocompleteDirective: NbAutocompleteDirective<string>;
  @ViewChild(NbAutocompleteComponent, { static: false }) autocompletePanel: NbAutocompleteComponent<string>
  @ViewChildren(NbOptionComponent) options: QueryList<NbOptionComponent<any>>;

  @ViewChild('autoInput', { static: true }) input: HTMLInputElement;

  groups = TEST_GROUPS;
  filteredGroups;

  constructor() {
    this.filteredGroups = this.groups;
  }

  handleFunction(item) {
    return item.value;
  }

  onChange($event) {
    this.filteredGroups = this.filter(this.input.value);
  }

  onSelectionChange($event) {
    this.filteredGroups = this.filter($event);
  }

  private filterOptions(options: any[], value: string) {
    return options.filter(item => item.toLowerCase().includes(value));
  }

  private filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.groups
      .map(group => {
        return {
          title: group.title,
          options: this.filterOptions(group.options, filterValue),
        }
      })
      .filter(group => group.options.length);
    }
}

describe('Component: NbAutocompleteComponent', () => {
  let fixture: ComponentFixture<NbAutocompleteTestComponent>;
  let overlayContainerService: NbOverlayContainerAdapter;
  let overlayContainer: HTMLElement;
  let document: Document;
  let input: HTMLInputElement;

  const openPanel = () => {
    fixture.componentInstance.autocompleteDirective.show();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        FormsModule,
        ReactiveFormsModule,
        NbThemeModule.forRoot(),
        NbLayoutModule,
        NbAutocompleteModule,
        NbOptionListModule,
      ],
      declarations: [
        NbAutocompleteTestComponent,
      ],
    });

    fixture = TestBed.createComponent(NbAutocompleteTestComponent);
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
    document = TestBed.get(NB_DOCUMENT);

    overlayContainerService = TestBed.get(NbOverlayContainerAdapter);
    overlayContainer = document.createElement('div');
    overlayContainerService.setContainer(overlayContainer);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.componentInstance.autocompleteDirective.hide();
    overlayContainerService.clearContainer();
  });


  it('should emit selectedChange option when option clicked', (done) => {
    openPanel();

    fixture.componentInstance.selectedChange.subscribe(selection => {
      expect(selection).toBe('Option 1');
      done();
    });

    const option = overlayContainer.querySelectorAll('nb-option')[0];
    option.dispatchEvent(new Event('click'));
  });

  it('should open overlay with options when input is focused', () => {
    input.dispatchEvent(new Event('focus'));
    expect(fixture.componentInstance.autocompleteDirective.isOpen).toBe(true);
    expect(overlayContainer.querySelector('nb-option-list')).toBeTruthy();
  });

  it('should close overlay when focusout input', () => {
    openPanel();
    document.dispatchEvent(new Event('click'));
    expect(fixture.componentInstance.autocompleteDirective.isClosed).toBe(true);
    expect(overlayContainer.querySelector('nb-option-list')).toBeFalsy();
  });

  it('should close overlay when option clicked', () => {
    openPanel();
    const option = overlayContainer.querySelectorAll('nb-option')[0];
    option.dispatchEvent(new Event('click'));
    expect(fixture.componentInstance.autocompleteDirective.isClosed).toBe(true);
    expect(overlayContainer.querySelector('nb-option-list')).toBeFalsy();
  });

  it('should open overlay programmatically', () => {
    openPanel();
    fixture.componentInstance.autocompleteDirective.show();
    expect(fixture.componentInstance.autocompleteDirective.isOpen).toBe(true);
    expect(overlayContainer.querySelector('nb-option-list')).toBeTruthy();
  });

  it('should close overlay programmatically', () => {
    openPanel();
    fixture.componentInstance.autocompleteDirective.hide();
    expect(fixture.componentInstance.autocompleteDirective.isClosed).toBe(true);
    expect(overlayContainer.querySelector('nb-option-list')).toBeFalsy();
  });

  it('should not close overlay when click input', () => {
    openPanel();
    input.dispatchEvent(new Event('click'));
    expect(fixture.componentInstance.autocompleteDirective.isOpen).toBe(true);
    expect(overlayContainer.querySelector('nb-option-list')).toBeTruthy();
  });

  it('should fill input when click option', () => {
    openPanel();
    const option = overlayContainer.querySelectorAll('nb-option')[0];
    option.dispatchEvent(new Event('click'));
    expect(option.textContent).toContain(input.textContent);
  });

  it('should fill input when click option', () => {
    openPanel();
    const option = overlayContainer.querySelectorAll('nb-option')[0];
    option.dispatchEvent(new Event('click'));

    expect(option.textContent).toContain(input.textContent);
  });

  it('should make option active when DOWN_ARROW pressed', () => {
    openPanel();

    input.dispatchEvent(new KeyboardEvent('keydown', <any> { keyCode: 40 }));
    const option = overlayContainer.querySelectorAll('nb-option')[0];
    fixture.detectChanges();

    expect(option.classList).toContain('active')
  });

  it('should fill input when ENTER pressed', () => {
    openPanel();
    const option = overlayContainer.querySelectorAll('nb-option')[0];

    input.dispatchEvent(new KeyboardEvent('keydown', <any> { keyCode: 40 }));
    input.dispatchEvent(new KeyboardEvent('keydown', <any> { keyCode: 13 }));

    expect(fixture.componentInstance.autocompleteDirective.isClosed).toBe(true);
    expect(option.textContent).toContain(input.textContent);
  });


  it('should close when ESC pressed', () => {
    openPanel();

    input.dispatchEvent(new KeyboardEvent('keydown', <any> { keyCode: 27 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.autocompleteDirective.isClosed).toBe(true);
  });

  it('should close overlay on input when TAB pressed', () => {
    openPanel();

    input.focus();
    expect(overlayContainer.querySelector('nb-option-list')).toBeTruthy();
    input.dispatchEvent(new KeyboardEvent('keydown', <any> { keyCode: 9 }));

    expect(fixture.componentInstance.autocompleteDirective.isClosed).toBe(true);
    expect(overlayContainer.querySelector('nb-option-list')).toBeFalsy();
  });

});