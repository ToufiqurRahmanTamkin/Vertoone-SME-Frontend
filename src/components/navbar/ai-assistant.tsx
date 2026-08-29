import { NAV_ICON_BUTTON } from "@/components/navbar/navbar-styles";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_NAME } from "@/config/branding";
import { cn } from "@/lib/utils";
import { selectCurrentUser } from "@/redux/authSlice";
import { ArrowUp, Hammer, RotateCcw, Sparkles, Square } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How many employees are on leave this week?",
  "Summarise this month's income and expense",
  "Which deals are closing soon?",
  "Show low stock products",
];

const PLACEHOLDER_REPLY =
  "I am not wired up to your data yet — this panel is the interface only. Once the assistant is connected, a question like that is answered here from your live workspace, with the records it used linked underneath.";

const REPLY_DELAY_MS = 700;

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export function AiAssistant() {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [thinking, setThinking] = React.useState(false);

  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const clearTimer = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  React.useEffect(() => clearTimer, [clearTimer]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;

    setMessages((prev) => [...prev, { id: newId(), role: "user", content: question }]);
    setInput("");
    setThinking(true);

    clearTimer();
    timer.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: PLACEHOLDER_REPLY },
      ]);
      setThinking(false);
      timer.current = null;
    }, REPLY_DELAY_MS);
  };

  const stop = () => {
    clearTimer();
    setThinking(false);
  };

  const reset = () => {
    clearTimer();
    setThinking(false);
    setMessages([]);
    setInput("");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  };

  const firstName = user?.name?.split(" ")[0];

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(NAV_ICON_BUTTON, "text-primary hover:text-primary")}
            onClick={() => setOpen(true)}
            aria-label="Ask AI"
          >
            <Sparkles className="size-[18px]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ask AI</TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3.5">
            <div className="flex items-center gap-2.5 pr-8">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <SheetTitle className="flex items-center gap-2 text-sm">
                  Ask {APP_NAME}
                  <span className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <Hammer className="size-2.5" />
                    UI only
                  </span>
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Questions about your workspace, answered in place.
                </SheetDescription>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 cursor-pointer text-muted-foreground"
                  onClick={reset}
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="size-4" />
                </Button>
              )}
            </div>
          </SheetHeader>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
            <div className="flex flex-col gap-4 p-4">
              {messages.length === 0 && !thinking ? (
                <div className="flex flex-col gap-4 py-6">
                  <div className="space-y-1.5 text-center">
                    <p className="text-sm font-semibold">
                      {firstName ? `Hello ${firstName}, what do you need?` : "What do you need?"}
                    </p>
                    <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted-foreground">
                      Ask about people, stock, money or pipeline. Answers stay scoped to what your
                      role is allowed to see.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => send(suggestion)}
                        className="cursor-pointer rounded-lg border bg-card/50 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border bg-muted/40 text-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}

              {thinking && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border bg-muted/40 px-3.5 py-3">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-3">
            <div className="relative rounded-xl border bg-card focus-within:border-primary/40">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask anything about your workspace..."
                className="max-h-32 min-h-11 resize-none border-0 bg-transparent pr-12 text-sm shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                size="icon"
                className="absolute right-2 bottom-2 size-7 cursor-pointer rounded-lg"
                onClick={() => (thinking ? stop() : send(input))}
                disabled={!thinking && input.trim().length === 0}
                aria-label={thinking ? "Stop" : "Send"}
              >
                {thinking ? <Square className="size-3 fill-current" /> : <ArrowUp className="size-4" />}
              </Button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-relaxed text-muted-foreground">
              Enter to send, Shift + Enter for a new line. Asked from{" "}
              <span className="font-medium">{location.pathname}</span>.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
