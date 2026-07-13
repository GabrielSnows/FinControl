import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";

import {
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

type FinSelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  disabled?: boolean;
};

type FinSelectProps = {
  label?: string;
  value?: string;
  options: FinSelectOption[];
  onChange: (
    value: string,
    option: FinSelectOption,
  ) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  helperText?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
};

type MenuPosition = {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
  openAbove: boolean;
};

export default function FinSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecione uma opção",
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhuma opção encontrada.",
  helperText,
  error,
  searchable = true,
  disabled = false,
  fullWidth = true,
  className = "",
}: FinSelectProps) {
  const generatedId = useId();

  const buttonId = `${generatedId}-button`;
  const listboxId = `${generatedId}-listbox`;
  const helperId = `${generatedId}-helper`;
  const errorId = `${generatedId}-error`;

  const containerRef =
    useRef<HTMLDivElement>(null);

  const buttonRef =
    useRef<HTMLButtonElement>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const searchInputRef =
    useRef<HTMLInputElement>(null);

  const optionRefs =
    useRef<Array<HTMLButtonElement | null>>([]);

  const [open, setOpen] = useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [highlightedIndex, setHighlightedIndex] =
    useState(0);

  const [menuPosition, setMenuPosition] =
    useState<MenuPosition>();

  const selectedOption = options.find(
    (option) => option.value === value,
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchText
      .trim()
      .toLocaleLowerCase("pt-BR");

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = [
        option.label,
        option.description ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return searchableText.includes(
        normalizedSearch,
      );
    });
  }, [options, searchText]);

  const enabledOptions = filteredOptions.filter(
    (option) => !option.disabled,
  );

  function calculateMenuPosition() {
    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const viewportPadding = 12;
    const menuGap = 8;
    const preferredHeight = 320;
    const minimumUsableHeight = 180;

    const availableWidth =
      window.innerWidth - viewportPadding * 2;

    const desiredWidth = Math.max(
      rect.width,
      240,
    );

    const width = Math.min(
      desiredWidth,
      availableWidth,
    );

    const maximumLeft =
      window.innerWidth -
      width -
      viewportPadding;

    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      maximumLeft,
    );

    const spaceBelow =
      window.innerHeight -
      rect.bottom -
      menuGap -
      viewportPadding;

    const spaceAbove =
      rect.top -
      menuGap -
      viewportPadding;

    const openAbove =
      spaceBelow < minimumUsableHeight &&
      spaceAbove > spaceBelow;

    const availableHeight = openAbove
      ? spaceAbove
      : spaceBelow;

    const maxHeight = Math.max(
      140,
      Math.min(
        preferredHeight,
        availableHeight,
      ),
    );

    setMenuPosition({
      left,
      width,
      maxHeight,
      openAbove,

      ...(openAbove
        ? {
            bottom:
              window.innerHeight -
              rect.top +
              menuGap,
          }
        : {
            top: rect.bottom + menuGap,
          }),
    });
  }

  useEffect(() => {
    if (!open) return;

    setSearchText("");

    const selectedIndex =
      filteredOptions.findIndex(
        (option) =>
          option.value === value &&
          !option.disabled,
      );

    setHighlightedIndex(
      selectedIndex >= 0
        ? selectedIndex
        : Math.max(
            filteredOptions.findIndex(
              (option) => !option.disabled,
            ),
            0,
          ),
    );

    calculateMenuPosition();

    const focusTimer = window.setTimeout(() => {
      if (searchable) {
        searchInputRef.current?.focus();
      }
    }, 0);

    function updatePosition() {
      calculateMenuPosition();
    }

    window.addEventListener(
      "resize",
      updatePosition,
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true,
    );

    return () => {
      window.clearTimeout(focusTimer);

      window.removeEventListener(
        "resize",
        updatePosition,
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true,
      );
    };
  }, [open, searchable, value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(
      event: MouseEvent | TouchEvent,
    ) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const clickedTrigger =
        containerRef.current?.contains(target);

      const clickedMenu =
        menuRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    document.addEventListener(
      "touchstart",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      document.removeEventListener(
        "touchstart",
        handlePointerDown,
      );
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (filteredOptions.length === 0) {
      setHighlightedIndex(0);
      return;
    }

    setHighlightedIndex((currentIndex) => {
      const currentOption =
        filteredOptions[currentIndex];

      if (
        currentOption &&
        !currentOption.disabled
      ) {
        return currentIndex;
      }

      const firstEnabledIndex =
        filteredOptions.findIndex(
          (option) => !option.disabled,
        );

      return Math.max(
        firstEnabledIndex,
        0,
      );
    });
  }, [filteredOptions, open]);

  useEffect(() => {
    if (!open) return;

    optionRefs.current[
      highlightedIndex
    ]?.scrollIntoView({
      block: "nearest",
    });
  }, [highlightedIndex, open]);

  function closeMenu(returnFocus = false) {
    setOpen(false);
    setSearchText("");

    if (returnFocus) {
      window.setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
    }
  }

  function selectOption(
    option: FinSelectOption,
  ) {
    if (option.disabled) return;

    onChange(option.value, option);
    closeMenu(true);
  }

  function findNextEnabledIndex(
    startIndex: number,
    direction: 1 | -1,
  ) {
    if (filteredOptions.length === 0) {
      return 0;
    }

    let nextIndex = startIndex;

    for (
      let count = 0;
      count < filteredOptions.length;
      count += 1
    ) {
      nextIndex =
        (nextIndex +
          direction +
          filteredOptions.length) %
        filteredOptions.length;

      if (
        !filteredOptions[nextIndex]?.disabled
      ) {
        return nextIndex;
      }
    }

    return startIndex;
  }

  function handleKeyboard(
    event: KeyboardEvent,
  ) {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      const direction =
        event.key === "ArrowDown"
          ? 1
          : -1;

      setHighlightedIndex((currentIndex) =>
        findNextEnabledIndex(
          currentIndex,
          direction,
        ),
      );

      return;
    }

    if (event.key === "Enter") {
      if (!open) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      const highlightedOption =
        filteredOptions[highlightedIndex];

      if (
        highlightedOption &&
        !highlightedOption.disabled
      ) {
        event.preventDefault();
        selectOption(highlightedOption);
      }

      return;
    }

    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        closeMenu(true);
      }

      return;
    }

    if (event.key === "Home" && open) {
      event.preventDefault();

      const firstEnabledIndex =
        filteredOptions.findIndex(
          (option) => !option.disabled,
        );

      if (firstEnabledIndex >= 0) {
        setHighlightedIndex(
          firstEnabledIndex,
        );
      }

      return;
    }

    if (event.key === "End" && open) {
      event.preventDefault();

      const lastEnabledIndex = [
        ...filteredOptions,
      ]
        .reverse()
        .findIndex(
          (option) => !option.disabled,
        );

      if (lastEnabledIndex >= 0) {
        setHighlightedIndex(
          filteredOptions.length -
            1 -
            lastEnabledIndex,
        );
      }
    }
  }

  const describedBy = [
    error ? errorId : undefined,

    !error && helperText
      ? helperId
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const menuStyle: CSSProperties | undefined =
    menuPosition
      ? {
          left: menuPosition.left,
          top: menuPosition.top,
          bottom: menuPosition.bottom,
          width: menuPosition.width,
          maxHeight:
            menuPosition.maxHeight,
        }
      : undefined;

  return (
    <div
      ref={containerRef}
      className={[
        "relative",
        fullWidth ? "w-full" : "w-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label
          htmlFor={buttonId}
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={
          open ? listboxId : undefined
        }
        aria-invalid={Boolean(error)}
        aria-describedby={
          describedBy || undefined
        }
        onKeyDown={handleKeyboard}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            setOpen(true);
          }
        }}
        className={[
          "flex h-10 min-w-0 cursor-pointer items-center rounded-[10px] border bg-[#111113] px-3.5 text-left text-base",
          "outline-none transition-[background-color,border-color,box-shadow,color,opacity] duration-150 ease-out",
          "hover:border-zinc-700",
          "focus-visible:border-zinc-500 focus-visible:bg-[#141416]",
          "focus-visible:ring-2 focus-visible:ring-zinc-700/40",
          "disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:opacity-60",
          error
            ? "border-red-900/80 focus-visible:border-red-800 focus-visible:ring-red-950/60"
            : "border-zinc-800",
          fullWidth ? "w-full" : "w-auto",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <OptionVisual
          option={selectedOption}
          placeholder={placeholder}
        />

        <ChevronDown
          aria-hidden="true"
          className={[
            "ml-3 h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150",
            open ? "rotate-180" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {error ? (
        <p
          id={errorId}
          className="mt-2 text-xs leading-5 text-red-400"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className="mt-2 text-xs leading-5 text-zinc-500"
        >
          {helperText}
        </p>
      ) : null}

      {open &&
        !disabled &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            onKeyDown={handleKeyboard}
            className={[
            "fixed z-100 flex origin-top flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-2xl shadow-black/50",              menuPosition.openAbove
                ? "origin-bottom animate-[fin-select-open-up_160ms_ease-out]"
                : "origin-top animate-[fin-select-open-down_160ms_ease-out]",
            ].join(" ")}
          >
            {searchable && (
              <div className="shrink-0 border-b border-zinc-800 p-2">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchText}
                    onChange={(event) =>
                      setSearchText(
                        event.target.value,
                      )
                    }
                    placeholder={
                      searchPlaceholder
                    }
                    aria-label={
                      searchPlaceholder
                    }
                    className="h-9 w-full rounded-lg border border-transparent bg-zinc-950 pl-9 pr-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-2 focus:ring-zinc-800"
                  />
                </div>
              </div>
            )}

            <div
              id={listboxId}
              role="listbox"
              className="min-h-0 flex-1 overflow-y-auto p-1.5"
            >
              {filteredOptions.length === 0 ||
              enabledOptions.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-zinc-500">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map(
                  (option, index) => {
                    const selected =
                      option.value === value;

                    const highlighted =
                      index ===
                      highlightedIndex;

                    return (
                      <button
                        key={option.value}
                        ref={(element) => {
                          optionRefs.current[
                            index
                          ] = element;
                        }}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={
                          option.disabled
                        }
                        onMouseEnter={() => {
                          if (
                            !option.disabled
                          ) {
                            setHighlightedIndex(
                              index,
                            );
                          }
                        }}
                        onClick={() =>
                          selectOption(option)
                        }
                        className={[
                          "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left outline-none transition duration-150",
                          option.disabled
                            ? "cursor-not-allowed opacity-40"
                            : "cursor-pointer",
                          highlighted
                            ? "bg-zinc-800/80"
                            : "bg-transparent",
                          selected
                            ? "text-zinc-50"
                            : "text-zinc-300",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <OptionImageOrIcon
                          option={option}
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {option.label}
                          </span>

                          {option.description && (
                            <span className="mt-0.5 block truncate text-xs text-zinc-500">
                              {
                                option.description
                              }
                            </span>
                          )}
                        </span>

                        {selected && (
                          <Check
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-zinc-200"
                          />
                        )}
                      </button>
                    );
                  },
                )
              )}
            </div>
          </div>,
          document.body,
        )}

      <style>
        {`
          @keyframes fin-select-open-down {
            from {
              opacity: 0;
              transform: translateY(-4px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fin-select-open-up {
            from {
              opacity: 0;
              transform: translateY(4px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}

type OptionVisualProps = {
  option?: FinSelectOption;
  placeholder: string;
};

function OptionVisual({
  option,
  placeholder,
}: OptionVisualProps) {
  if (!option) {
    return (
      <span className="min-w-0 flex-1 truncate text-zinc-600">
        {placeholder}
      </span>
    );
  }

  return (
    <>
      <OptionImageOrIcon option={option} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-zinc-100">
          {option.label}
        </span>
      </span>
    </>
  );
}

type OptionImageOrIconProps = {
  option: FinSelectOption;
};

function OptionImageOrIcon({
  option,
}: OptionImageOrIconProps) {
  if (option.image) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-50 p-1">
        <img
          src={option.image}
          alt=""
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  if (option.icon) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 [&>svg]:h-4 [&>svg]:w-4">
        {option.icon}
      </span>
    );
  }

  return null;
}

export type {
  FinSelectOption,
  FinSelectProps,
};