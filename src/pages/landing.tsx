import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bug,
  ArrowRight,
  CheckCircle,
  MessageSquarePlus,
  GitBranch,
  GitPullRequest,
  GitMerge,
  Sparkles,
  Users,
  Zap,
  Shield,
  Github,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Pipeline steps — the core story of BugFixer
const pipelineSteps = [
  {
    icon: MessageSquarePlus,
    label: 'Bug Reported',
    description: 'Customer or tester reports a bug via your project board or embeddable widget.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: Bug,
    label: 'Triaged',
    description: 'Bugs are auto-categorized by priority and assigned to the right team member.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Github,
    label: 'GitHub Issue Created',
    description: 'Automatically syncs to GitHub — creates an issue with labels in your connected repo.',
    color: 'text-foreground',
    bg: 'bg-foreground/10',
  },
  {
    icon: Bot,
    label: 'AI Agent Analyzes',
    description: 'Our AI agent reads the codebase, understands the bug, and writes a fix autonomously.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: GitPullRequest,
    label: 'PR Raised',
    description: 'A pull request is opened automatically with the proposed fix, ready for review.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: GitMerge,
    label: 'Merged & Deployed',
    description: 'Review, approve, merge — the reporter gets notified when the fix ships.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
];

const capabilities = [
  {
    icon: GitBranch,
    title: 'GitHub Integration',
    description: 'Connect your repos. Issues and PRs sync bi-directionally — no copy-paste.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Fixes',
    description: 'An AI agent reads your code, generates a fix, and opens a PR. You just review.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite your team with fine-grained roles — Viewer, Member, Admin.',
  },
  {
    icon: Zap,
    title: 'Blazingly Fast',
    description: 'Minimal, snappy UI. No loading spinners, no bloated dashboards.',
  },
  {
    icon: Shield,
    title: 'Access Control',
    description: 'Private & public projects, invitation flows, access requests — all built in.',
  },
  {
    icon: Sparkles,
    title: 'Smart Notifications',
    description: 'Reporters get emailed when their bug is fixed. Your team stays in sync.',
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col overflow-hidden">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative py-24 md:py-36">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-primary/5 text-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              From bug report to pull request — automated
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              Customers report bugs.
              <br />
              <span className="text-primary">AI ships the fix.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              BugFixer connects your bug tracker to GitHub and an AI coding agent.
              Bugs go in, pull requests come out — your team just reviews and merges.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/signup">
                      Start for Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/explore">Explore Projects</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      </section>

      {/* ─── Pipeline — The Core Story ─────────────────── */}
      <section className="py-20 md:py-28 border-y bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How it works
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-xl mx-auto"
            >
              Six steps. Fully automated. You stay in control.
            </motion.p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            {/* ── Animated vertical line (desktop) ── */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, delay: 0.2, ease: 'easeInOut' }}
              className="absolute left-1/2 top-0 bottom-0 w-px origin-top -translate-x-1/2 hidden md:block"
              style={{
                background:
                  'linear-gradient(to bottom, var(--color-border), var(--color-primary), var(--color-border))',
              }}
            />
            {/* ── Animated vertical line (mobile) ── */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, delay: 0.2, ease: 'easeInOut' }}
              className="absolute left-6 top-0 bottom-0 w-px origin-top md:hidden"
              style={{
                background:
                  'linear-gradient(to bottom, var(--color-border), var(--color-primary), var(--color-border))',
              }}
            />

            <div className="space-y-10 md:space-y-16">
              {pipelineSteps.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div key={step.label} className="relative flex gap-4 md:gap-0">
                    {/* ── Mobile layout ── */}
                    <div className="md:hidden flex gap-4 items-start">
                      {/* Icon with pulse */}
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 15,
                          delay: i * 0.12,
                        }}
                        className="relative z-10"
                      >
                        {/* Ping ring */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12 + 0.4 }}
                          className="absolute -inset-1 rounded-xl animate-ping opacity-20"
                          style={{ animationDuration: '2.5s' }}
                        >
                          <div className={`h-full w-full rounded-xl ${step.bg}`} />
                        </motion.div>
                        <div
                          className={`shrink-0 h-12 w-12 rounded-xl ${step.bg} flex items-center justify-center`}
                        >
                          <step.icon className={`h-6 w-6 ${step.color}`} />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.12 + 0.15 }}
                        className="pt-1"
                      >
                        <div className="text-xs font-mono text-muted-foreground mb-1">
                          Step {i + 1}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{step.label}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </motion.div>
                    </div>

                    {/* ── Desktop layout — alternating sides ── */}
                    <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-10 md:items-center w-full">
                      {/* Left content */}
                      <motion.div
                        initial={{ opacity: 0, x: isEven ? -40 : 0 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.55,
                          delay: i * 0.12 + 0.2,
                          ease: 'easeOut',
                        }}
                        className={isEven ? 'text-right' : ''}
                      >
                        {isEven && (
                          <div>
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.12 + 0.3 }}
                              className="text-xs font-mono text-muted-foreground mb-1"
                            >
                              Step {i + 1}
                            </motion.div>
                            <h3 className="font-semibold text-lg mb-1">{step.label}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        )}
                      </motion.div>

                      {/* Center icon — spring pop-in + hover float */}
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          type: 'spring',
                          stiffness: 220,
                          damping: 16,
                          delay: i * 0.12,
                        }}
                        whileHover={{ scale: 1.15, rotate: 6 }}
                        className="relative z-10 cursor-default"
                      >
                        {/* Glow ring */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12 + 0.4 }}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.35, 1],
                              opacity: [0.35, 0, 0.35],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              delay: i * 0.3,
                              ease: 'easeInOut',
                            }}
                            className={`absolute -inset-1.5 rounded-xl ${step.bg}`}
                          />
                        </motion.div>
                        <div
                          className={`shrink-0 h-12 w-12 rounded-xl ${step.bg} flex items-center justify-center shadow-sm`}
                        >
                          <step.icon className={`h-6 w-6 ${step.color}`} />
                        </div>
                      </motion.div>

                      {/* Right content */}
                      <motion.div
                        initial={{ opacity: 0, x: !isEven ? 40 : 0 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.55,
                          delay: i * 0.12 + 0.2,
                          ease: 'easeOut',
                        }}
                      >
                        {!isEven && (
                          <div>
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.12 + 0.3 }}
                              className="text-xs font-mono text-muted-foreground mb-1"
                            >
                              Step {i + 1}
                            </motion.div>
                            <h3 className="font-semibold text-lg mb-1">{step.label}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Capabilities Grid ─────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything you need.{' '}
              <span className="text-primary">Nothing you don't.</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Built by developers, for developers. We stripped away the bloat and kept what matters.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group p-6 rounded-xl border bg-card hover:border-primary/30 transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <cap.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{cap.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {cap.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative overflow-hidden border-t bg-muted/30">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Stop chasing bugs.
              <br />
              <span className="text-primary">Let them fix themselves.</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground mb-8"
            >
              Set up your project in under 2 minutes. Connect GitHub, enable the AI agent, and let BugFixer handle the rest.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
            >
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started — It's Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              {['No credit card required', 'Free for small teams', 'Setup in 2 minutes'].map(
                (text) => (
                  <span key={text} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    {text}
                  </span>
                )
              )}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/5 rounded-full blur-3xl z-0" />
      </section>

      {/* ─── Footer ───────────────────────────────────── */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bug className="h-4 w-4" />
              <span>© 2026 BugFixer. Built with ❤️ for developers.</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
