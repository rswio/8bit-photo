import "@fontsource/press-start-2p";
import { PixelConverter } from "@/components/PixelConverter";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>8-Bit Photo Converter | Free Retro Pixel Art Generator</title>
        <meta
          name="description"
          content="Convert your photos into retro 8-bit pixel art instantly in your browser. Free online tool with Game Boy, NES, CGA palettes. No uploads, 100% private."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-yellow" />

        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <header className="text-center mb-10 md:mb-14">
            <h1 className="text-xl md:text-3xl lg:text-4xl text-primary text-glow-pink mb-4 tracking-wider">
              8-BIT PHOTO
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl text-secondary text-glow-cyan mb-6">CONVERTER</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              TRANSFORM YOUR PHOTOS INTO AUTHENTIC RETRO PIXEL ART
            </p>
          </header>

          {/* Main Converter */}
          <PixelConverter />

          {/* Features Section */}
          <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card border-2 border-primary/30 text-center">
              <div className="text-2xl mb-3">🎮</div>
              <h3 className="text-xs text-primary mb-2">RETRO PALETTES</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                GAME BOY, NES, CGA AND MORE CLASSIC PALETTES
              </p>
            </div>
            <div className="p-6 bg-card border-2 border-secondary/30 text-center">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="text-xs text-secondary mb-2">100% PRIVATE</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                ALL PROCESSING HAPPENS IN YOUR BROWSER
              </p>
            </div>
            <div className="p-6 bg-card border-2 border-accent/30 text-center">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="text-xs text-accent mb-2">INSTANT RESULTS</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                REAL-TIME PREVIEW AS YOU ADJUST SETTINGS
              </p>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="mt-16 max-w-3xl mx-auto space-y-8">
            <article className="text-center">
              <h2 className="text-sm md:text-base text-primary text-glow-pink mb-4">
                WHAT IS 8-BIT PIXEL ART?
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                8-bit pixel art refers to the iconic visual style from classic video game consoles like the Nintendo Entertainment System (NES), Game Boy, and early PC graphics. This distinctive aesthetic features limited color palettes, blocky pixels, and nostalgic charm that defined an entire generation of gaming.
              </p>
            </article>

            <article className="text-center">
              <h2 className="text-sm md:text-base text-secondary text-glow-cyan mb-4">
                HOW DOES THE CONVERTER WORK?
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                Our free online 8-bit photo converter transforms any image into authentic retro pixel art instantly. Simply upload your photo, choose your preferred pixel size and color palette, and watch as your image transforms into nostalgic pixel art. The entire process happens in your browser — no uploads to external servers, ensuring your photos remain completely private.
              </p>
            </article>

            <article className="text-center">
              <h2 className="text-sm md:text-base text-accent mb-4">
                AVAILABLE COLOR PALETTES
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-muted-foreground">
                <div className="p-4 bg-card/50 border border-border/30">
                  <h3 className="text-primary mb-2">GAME BOY</h3>
                  <p>The classic 4-shade green palette from Nintendo's legendary handheld console, perfect for that authentic 1989 portable gaming look.</p>
                </div>
                <div className="p-4 bg-card/50 border border-border/30">
                  <h3 className="text-secondary mb-2">NES</h3>
                  <p>The full 54-color palette from the Nintendo Entertainment System, bringing back memories of Super Mario Bros and The Legend of Zelda.</p>
                </div>
                <div className="p-4 bg-card/50 border border-border/30">
                  <h3 className="text-accent mb-2">CGA</h3>
                  <p>The iconic 4-color palette from IBM's Color Graphics Adapter, featuring the memorable cyan, magenta, and white combination from early PC gaming.</p>
                </div>
                <div className="p-4 bg-card/50 border border-border/30">
                  <h3 className="text-foreground mb-2">ORIGINAL</h3>
                  <p>Keep your image's original colors while applying the pixelation effect for a modern take on retro aesthetics.</p>
                </div>
              </div>
            </article>

            <article className="text-center">
              <h2 className="text-sm md:text-base text-primary text-glow-pink mb-4">
                PERFECT FOR CREATORS
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                Whether you're creating retro-style profile pictures, designing indie game assets, making nostalgic social media content, or just having fun with pixel art, our 8-bit converter delivers instant results. Download your creations as high-quality PNG files ready to share anywhere.
              </p>
            </article>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center border-t border-border/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/rswio/8bit-photo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
              aria-label="View 8-Bit Photo Converter source code on GitHub"
            >
              VIEW ON GITHUB
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://www.buymeacoffee.com/rswio" target="_blank" rel="noopener noreferrer">
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee - Support 8-Bit Photo Converter"
                className="h-20"
              />
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground">MADE FOR PIXEL ART LOVERS</p>
        </footer>

        {/* Decorative bottom bar */}
        <div className="h-2 bg-gradient-to-r from-neon-yellow via-neon-cyan to-neon-pink" />
      </div>
    </>
  );
};

export default Index;
