import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    FileCheck2,
    MapPinned,
    ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

const slides = [
    {
        title: 'Reporta atracos en segundos y de forma anónima',
        text: 'Comparte información útil sin comprometer tu identidad personal.',
        eyebrow: 'Reporte rápido',
        alt: 'Reporte anónimo',
        icon: ShieldCheck,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOcAaH4AerchqWxdPH63yROoRRaIFqQkDfxKNvcJ-bos9JQXksUxX5HmsjnW-1gZoO9vffX5oYpHDKDxJrgYmmc6qfR9P8Vsaqbd0crQPCHMwRMd2MysPlgZ1zZ_-bS1eRueheQOIwAvEPDqZzt5PLwiEetRDV8Ory9WNuR9oOtbb49bXRusC3rbNLmHK4ZG5Pc4QJ3C_bol-yOB7WZvWaIJwtkVgRU4z6wTTn4wFfuTEeH4OHw6krL3-cv08EgPUQP7tsx-xNnfY',
    },
    {
        title: 'Mira un mapa de riesgo en tiempo real de tu ciudad',
        text: 'Toma decisiones informadas sobre tus rutas diarias con datos actualizados por la comunidad.',
        eyebrow: 'Mapa comunitario',
        alt: 'Mapa de riesgo',
        icon: MapPinned,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2Y3Efa88_6tF6cRIZbhPLpwNhsK-qKAQ_7gqruuLD6U5NGaUSvPMh9vSvzywr4XxHb6QS4X52BkT1wLYqcpVZfyUxZcKwIm9DaSgojGCoujYj7lW8zeUPprmkYGjJn1SRVQTi8TQ6ndBPHWqdRQx0Sv_z9kaW_atRELnXItq7XIZQpfqjoODGM4Z0-VVQxnvojmN75OISGA-5xA9CA4ww_1GuiwIn455bEFrIcFzzB8U929X5LHoGwCOdWshib3OPEedgsaaCPlA',
    },
    {
        title: 'Reportamos hechos en lugares, nunca acusamos personas',
        text: 'En AlertaCalle nos enfocamos en la prevención urbana bajo principios de respeto, legalidad y privacidad.',
        eyebrow: 'Privacidad y respeto',
        alt: 'Compromiso ético',
        icon: FileCheck2,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGz9_ez2-9YCXJ4M_jPvB8mUdjAMiSFUF7rvgoGOchLRZW2AuvwtNImtilO8aMHNyhG4A7XGbFMunpb1NzLGLu4UQFrNptFvvkO-filYT1qpKuAYNPD-jNxTdzeUnLrXpsaKN5hJo-SdDHA8ZrymCkudQSVMjVotwIrbhOZkfm_E5Xr7GLRNGYObHtHIWC2WEGes3c5c3SN2W08S0zuMLKF6_FYQAr5vx0O-AztwYnxk39Lu2IRPmnpaTRh9RZuJhjdXm87JntS-w',
    },
];

export default function Welcome() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [accepted, setAccepted] = useState(false);

    const sliderStyle = useMemo(
        () => ({ transform: `translateX(-${currentSlide * 100}vw)` }),
        [currentSlide],
    );

    return (
        <>
            <Head title="AlertaCalle" />

            <main className="ac-landing-shell relative grid min-h-dvh w-full grid-rows-[auto_1fr_auto] overflow-x-hidden bg-[var(--ac-background)] text-[var(--ac-on-surface)] selection:bg-[var(--ac-primary-fixed)]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="ac-landing-glow ac-landing-glow-primary" />
                    <div className="ac-landing-glow ac-landing-glow-secondary" />
                    <div className="ac-landing-grid" />
                </div>

                <header className="relative z-20 flex justify-center px-4 pt-[clamp(1rem,4vh,3rem)] pb-3 sm:px-6">
                    <Link
                        href="/"
                        className="ac-glass-pill flex min-h-11 max-w-full items-center gap-2 rounded-full px-4 text-[var(--ac-primary)] shadow-sm transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none"
                    >
                        <ShieldCheck
                            className="size-[clamp(1.35rem,4vw,1.85rem)] shrink-0"
                            aria-hidden="true"
                        />
                        <span className="text-[clamp(1.35rem,5vw,1.85rem)] leading-9 font-bold">
                            AlertaCalle
                        </span>
                    </Link>
                </header>

                <div className="relative z-10 w-screen overflow-hidden">
                    <div
                        className="slide-transition flex h-full w-[300vw]"
                        style={sliderStyle}
                    >
                        {slides.map((slide, index) => {
                            const Icon = slide.icon;

                            return (
                                <section
                                    key={slide.title}
                                    className="flex w-screen shrink-0 items-center px-4 py-[clamp(0.75rem,2vh,1.5rem)] text-center sm:px-6 lg:text-left"
                                    aria-hidden={currentSlide !== index}
                                >
                                    <div className="mx-auto grid w-full max-w-6xl items-center gap-[clamp(1.25rem,4vh,3rem)] lg:grid-cols-[0.92fr_1fr] lg:gap-12">
                                        <div className="order-1 flex justify-center lg:order-none">
                                            <div className="ac-hero-orbit relative flex h-[clamp(13.5rem,58vmin,24rem)] w-[clamp(13.5rem,58vmin,24rem)] max-w-[78vw] items-center justify-center overflow-hidden rounded-full border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-low)] shadow-[0_24px_70px_rgba(64,89,170,0.18)]">
                                                <div className="absolute inset-[8%] rounded-full bg-white/42 backdrop-blur-sm" />
                                                <div className="absolute top-[16%] left-[15%] size-[13%] rounded-full bg-[var(--ac-secondary-fixed)]/75 blur-sm" />
                                                <div className="absolute right-[14%] bottom-[16%] size-[18%] rounded-full bg-[var(--ac-primary-fixed-dim)]/75 blur-md" />
                                                <div className="absolute top-[13%] right-[16%] flex size-[clamp(2.4rem,8vw,3rem)] items-center justify-center rounded-2xl bg-white/80 text-[var(--ac-secondary)] shadow-sm backdrop-blur">
                                                    <Icon
                                                        className="size-5"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <img
                                                    src={slide.image}
                                                    alt={slide.alt}
                                                    className="ac-hero-image relative z-10 h-4/5 w-4/5 object-contain"
                                                    draggable={false}
                                                />
                                            </div>
                                        </div>

                                        <div className="order-2 mx-auto w-full max-w-[34rem] space-y-[clamp(0.85rem,2.4vh,1.4rem)] lg:order-none lg:mx-0">
                                            <p className="mx-auto inline-flex min-h-8 items-center gap-2 rounded-full bg-[var(--ac-primary-fixed)] px-3 text-sm font-bold text-[var(--ac-on-primary-fixed)] lg:mx-0">
                                                <Icon
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                                {slide.eyebrow}
                                            </p>

                                            <h1 className="mx-auto max-w-[30rem] text-[clamp(1.45rem,5vw,2.65rem)] leading-[1.12] font-bold text-[var(--ac-on-surface)] lg:mx-0">
                                                {slide.title}
                                            </h1>

                                            <p className="mx-auto max-w-[28rem] text-[clamp(0.95rem,2.4vw,1.12rem)] leading-7 text-[var(--ac-on-surface-variant)] lg:mx-0">
                                                {slide.text}
                                            </p>

                                            {index === 2 && (
                                                <div className="ac-consent-card mx-auto mt-4 max-w-[30rem] rounded-xl border border-[var(--ac-outline-variant)] bg-[var(--ac-surface-container-highest)]/78 p-4 text-left shadow-sm backdrop-blur lg:mx-0">
                                                    <label className="flex cursor-pointer items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={accepted}
                                                            onChange={(event) =>
                                                                setAccepted(
                                                                    event.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="mt-1 size-5 shrink-0 rounded border-[var(--ac-outline)] text-[var(--ac-primary)] accent-[var(--ac-primary)] focus:ring-[var(--ac-primary-container)]"
                                                        />
                                                        <span className="text-sm leading-5 font-medium text-[var(--ac-on-surface-variant)]">
                                                            Acepto el
                                                            tratamiento de datos
                                                            personales bajo la
                                                            Ley 1581 y los
                                                            términos de uso
                                                            centrados en la
                                                            convivencia
                                                            ciudadana.
                                                        </span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>

                <footer className="relative z-20 flex flex-col items-center gap-[clamp(1rem,3vh,2rem)] px-4 pt-2 pb-[clamp(1rem,4vh,3rem)] sm:px-6">
                    <div
                        className="flex min-h-6 items-center gap-2"
                        aria-label="Progreso de introducción"
                    >
                        {slides.map((slide, index) => (
                            <button
                                key={slide.title}
                                type="button"
                                aria-label={`Ir al paso ${index + 1}`}
                                onClick={() => setCurrentSlide(index)}
                                className={cn(
                                    'h-2 rounded-full bg-[var(--ac-outline-variant)] transition-all duration-300',
                                    currentSlide === index
                                        ? 'w-6 bg-[var(--ac-primary-container)]'
                                        : 'w-2 hover:bg-[var(--ac-outline)]',
                                )}
                            />
                        ))}
                    </div>

                    <div className="grid w-full max-w-[400px] gap-3">
                        {currentSlide < slides.length - 1 ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentSlide((slide) =>
                                        Math.min(slide + 1, slides.length - 1),
                                    )
                                }
                                className="ac-primary-action inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ac-primary)] px-5 text-base leading-6 font-semibold text-white shadow-[0_14px_30px_rgba(0,35,111,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--ac-primary-container)] focus-visible:outline-none active:scale-[0.98] sm:text-lg"
                            >
                                Siguiente
                                <ArrowRight
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </button>
                        ) : (
                            <Link
                                href={accepted ? '/mapa' : '#'}
                                aria-disabled={!accepted}
                                onClick={(event) => {
                                    if (!accepted) {
                                        event.preventDefault();
                                    }
                                }}
                                className={cn(
                                    'ac-primary-action inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ac-primary)] px-5 text-base leading-6 font-semibold text-white shadow-[0_14px_30px_rgba(0,35,111,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--ac-primary-container)] focus-visible:outline-none active:scale-[0.98] sm:text-lg',
                                    !accepted &&
                                        'cursor-not-allowed opacity-50 hover:translate-y-0 hover:brightness-100',
                                )}
                            >
                                <CheckCircle2
                                    className="size-5"
                                    aria-hidden="true"
                                />
                                Acepto y comienzo
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => setCurrentSlide(slides.length - 1)}
                            className={cn(
                                'min-h-10 rounded-xl text-sm font-semibold text-[var(--ac-on-surface-variant)] transition-colors hover:text-[var(--ac-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ac-primary)] focus-visible:outline-none',
                                currentSlide === slides.length - 1 &&
                                    'invisible',
                            )}
                        >
                            Saltar introducción
                        </button>
                    </div>
                </footer>
            </main>
        </>
    );
}
