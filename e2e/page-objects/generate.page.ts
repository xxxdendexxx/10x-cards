import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the generate flashcards page.
 * Contains selectors and methods for interacting with the generate page.
 */
export class GeneratePage {
  readonly page: Page;
  readonly container: Locator;
  readonly header: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly flashcardsContainer: Locator;
  readonly generateForm: Locator;
  readonly sourceTextContainer: Locator;
  readonly sourceTextLabel: Locator;
  readonly sourceTextInput: Locator;
  readonly characterCount: Locator;
  readonly sourceTextError: Locator;
  readonly generateButton: Locator;
  readonly generatingState: Locator;
  readonly proposalList: Locator;
  readonly saveApprovedButton: Locator;
  readonly editFlashcardModal: Locator;

  /**
   * Initialize the page model with element selectors
   */
  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("generate-page-container");
    this.header = page.getByTestId("generate-page-header");
    this.title = page.getByTestId("generate-page-title");
    this.description = page.getByTestId("generate-page-description");
    this.flashcardsContainer = page.getByTestId("generate-flashcards-container");
    this.generateForm = page.getByTestId("generate-flashcards-form");
    this.sourceTextContainer = page.getByTestId("source-text-container");
    this.sourceTextLabel = page.getByTestId("source-text-label");
    this.sourceTextInput = page.getByTestId("source-text-input");
    this.characterCount = page.getByTestId("character-count");
    this.sourceTextError = page.getByTestId("source-text-error");
    this.generateButton = page.getByTestId("generate-button");
    this.generatingState = page.getByTestId("generating-state");
    this.proposalList = page.getByTestId("flashcard-proposal-list");
    this.saveApprovedButton = page.getByTestId("save-approved-button");
    this.editFlashcardModal = page.getByTestId("edit-flashcard-modal");
  }

  /**
   * Navigate to the generate page
   */
  async goto() {
    await this.page.goto("/generate");
  }

  /**
   * Check if the generate page is fully loaded
   */
  async isLoaded() {
    await this.container.waitFor({ state: "visible" });
    await this.header.waitFor({ state: "visible" });
    await this.flashcardsContainer.waitFor({ state: "visible" });
    await this.generateForm.waitFor({ state: "visible" });
    return true;
  }

  /**
   * Enter source text in the textarea
   */
  async enterSourceText(text: string) {
    await this.sourceTextInput.fill(text);
  }

  /**
   * Click the generate button to generate flashcards
   */
  async clickGenerateButton() {
    await this.generateButton.click();
  }

  /**
   * Wait for the generating state to appear
   */
  async waitForGeneratingState() {
    await this.generatingState.waitFor({ state: "visible" });
  }

  /**
   * Wait for the generating state to disappear
   */
  async waitForGeneratingComplete() {
    // Wait for the generating element to disappear, indicating the request is complete
    await this.generatingState.waitFor({ state: "hidden", timeout: 30000 }).catch(() => {
      // If element is not found (already gone), that's fine
    });
  }

  /**
   * Get the character count text
   */
  async getCharacterCount() {
    return await this.characterCount.textContent();
  }

  /**
   * Get the source text error message (if any)
   */
  async getSourceTextError() {
    if (await this.sourceTextError.isVisible()) {
      return await this.sourceTextError.textContent();
    }
    return null;
  }

  /**
   * Check if flashcard proposals are visible
   */
  async areProposalsVisible() {
    return await this.proposalList.isVisible();
  }

  /**
   * Check if the save approved button is visible
   */
  async isSaveButtonVisible() {
    return await this.saveApprovedButton.isVisible();
  }

  /**
   * Enter source text and generate flashcards
   */
  async generateFlashcards(text: string) {
    await this.enterSourceText(text);
    await this.clickGenerateButton();
    await this.waitForGeneratingState();
    await this.waitForGeneratingComplete();
  }
}
