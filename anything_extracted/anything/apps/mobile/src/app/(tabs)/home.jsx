import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Sparkles,
  TrendingUp,
  Bell,
  ChevronRight,
  Leaf,
  Heart,
  BookOpen,
  Home,
  Landmark,
  Users,
  Star,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react-native";
import SchemeCard from "@/components/SchemeCard";

const TRENDING_SCHEMES = [
  {
    id: "1",
    title: "PM Kisan Samman Nidhi",
    description:
      "Income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
    matchScore: 95,
    type: "Central",
  },
  {
    id: "2",
    title: "Ayushman Bharat (PM-JAY)",
    description:
      "Health insurance cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization.",
    matchScore: 88,
    type: "Central",
  },
  {
    id: "3",
    title: "Ladli Behna Yojana",
    description:
      "Financial assistance to women to enhance their health, nutrition and financial independence.",
    matchScore: 92,
    type: "State",
  },
];

const CATEGORIES = [
  { id: "1", label: "Agriculture", icon: Leaf, color: "#22c55e" },
  { id: "2", label: "Health", icon: Heart, color: "#ef4444" },
  { id: "3", label: "Education", icon: BookOpen, color: "#3b82f6" },
  { id: "4", label: "Housing", icon: Home, color: "#a78bfa" },
  { id: "5", label: "Finance", icon: Landmark, color: "#f59e0b" },
  { id: "6", label: "Women", icon: Users, color: "#ec4899" },
];

const STATS = [
  { value: "4,200+", label: "Schemes" },
  { value: "₹2.8Cr", label: "Disbursed" },
  { value: "28", label: "States" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build Your Profile",
    desc: "Answer a few simple questions about your income, location, and family.",
    icon: Users,
  },
  {
    step: "02",
    title: "AI Matches You",
    desc: "Our engine scans 4,200+ schemes and ranks your eligibility instantly.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Apply in Minutes",
    desc: "Use your secure Document Vault to apply with pre-filled forms.",
    icon: CheckCircle,
  },
];

const TESTIMONIALS = [
  {
    id: "1",
    name: "Ramesh Kumar",
    location: "Bihar",
    text: "Got ₹6,000 from PM Kisan within 2 weeks of applying via YojanaMitra. Life-changing!",
    scheme: "PM Kisan Samman Nidhi",
    rating: 5,
  },
  {
    id: "2",
    name: "Sunita Devi",
    location: "Rajasthan",
    text: "The AI matched me with 5 schemes I had no idea about. Already approved for Ayushman Bharat.",
    scheme: "Ayushman Bharat",
    rating: 5,
  },
];

function StatCard({ value, label }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function CategoryPill({ item }) {
  const IconComp = item.icon;
  return (
    <TouchableOpacity activeOpacity={0.75} style={catStyles.pill}>
      <View style={[catStyles.iconBox, { backgroundColor: item.color + "22" }]}>
        <IconComp size={20} color={item.color} />
      </View>
      <Text style={catStyles.label}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function StepCard({ step, title, desc, icon: IconComp, isLast }) {
  return (
    <View style={stepStyles.row}>
      <View style={stepStyles.leftCol}>
        <View style={stepStyles.iconCircle}>
          <IconComp size={18} color="#f97316" />
        </View>
        {!isLast && <View style={stepStyles.connector} />}
      </View>
      <View style={stepStyles.content}>
        <Text style={stepStyles.stepNum}>STEP {step}</Text>
        <Text style={stepStyles.title}>{title}</Text>
        <Text style={stepStyles.desc}>{desc}</Text>
        {!isLast && <View style={{ height: 20 }} />}
      </View>
    </View>
  );
}

function TestimonialCard({ item }) {
  return (
    <View style={testimonialStyles.card}>
      <View style={testimonialStyles.topRow}>
        <View style={testimonialStyles.avatar}>
          <Text style={testimonialStyles.avatarText}>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={testimonialStyles.name}>{item.name}</Text>
          <Text style={testimonialStyles.location}>📍 {item.location}</Text>
        </View>
        <View style={testimonialStyles.stars}>
          {Array.from({ length: item.rating }).map((_, i) => (
            <Star key={i} size={12} color="#f59e0b" fill="#f59e0b" />
          ))}
        </View>
      </View>
      <Text style={testimonialStyles.text}>"{item.text}"</Text>
      <View style={testimonialStyles.schemeBadge}>
        <CheckCircle size={11} color="#22c55e" />
        <Text style={testimonialStyles.schemeLabel}>{item.scheme}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0b1a16", paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Header ── */}
        <View style={headerStyles.row}>
          <View style={headerStyles.left}>
            <View style={headerStyles.logo}>
              <Text style={headerStyles.logoText}>YM</Text>
            </View>
            <View>
              <Text style={headerStyles.appName}>YojanaMitra</Text>
              <Text style={headerStyles.tagline}>Your welfare companion</Text>
            </View>
          </View>
          <TouchableOpacity style={headerStyles.bell} activeOpacity={0.7}>
            <Bell size={20} color="#f8fafc" />
            <View style={headerStyles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ── Hero ── */}
        <Animated.View
          style={[
            heroStyles.wrap,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={heroStyles.aiChip}>
            <Sparkles size={13} color="#f97316" />
            <Text style={heroStyles.aiChipText}>AI-Powered Matching</Text>
          </View>
          <Text style={heroStyles.title}>
            Access Government Welfare{" "}
            <Text style={{ color: "#f97316" }}>Made Simple</Text>
          </Text>
          <Text style={heroStyles.subtitle}>
            Personalised scheme matches for 140Cr+ citizens. Answer 5 questions
            and discover benefits you deserve today.
          </Text>

          <TouchableOpacity style={heroStyles.cta} activeOpacity={0.85}>
            <Sparkles size={18} color="#fff" />
            <Text style={heroStyles.ctaText}>Match Me With Schemes</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={heroStyles.secondary} activeOpacity={0.75}>
            <Text style={heroStyles.secondaryText}>
              Browse All 4,200+ Schemes
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Stats Bar ── */}
        <View style={statsStyles.row}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <StatCard {...s} />
              {i < STATS.length - 1 && <View style={statsStyles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Profile Completion Nudge ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <TouchableOpacity style={nudgeStyles.card} activeOpacity={0.8}>
            <View style={nudgeStyles.left}>
              <View style={nudgeStyles.iconBox}>
                <Zap size={20} color="#f97316" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={nudgeStyles.title}>Complete Your Profile</Text>
                <Text style={nudgeStyles.subtitle}>
                  Unlock 12 more scheme matches tailored to you
                </Text>
                <View style={nudgeStyles.barBg}>
                  <View style={nudgeStyles.barFill} />
                </View>
                <Text style={nudgeStyles.progress}>60% complete</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#f97316" />
          </TouchableOpacity>
        </View>

        {/* ── Category Grid ── */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader title="Browse by Category" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {CATEGORIES.map((cat) => (
              <CategoryPill key={cat.id} item={cat} />
            ))}
          </ScrollView>
        </View>

        {/* ── Trending Schemes ── */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader title="Trending Schemes" linkText="See All" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
          >
            {TRENDING_SCHEMES.map((scheme) => (
              <View key={scheme.id} style={{ width: 300 }}>
                <SchemeCard scheme={scheme} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Featured Scheme ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <SectionHeader title="Featured This Week" />
          <TouchableOpacity style={featuredStyles.card} activeOpacity={0.85}>
            <View style={featuredStyles.topRow}>
              <View style={featuredStyles.badge}>
                <TrendingUp size={11} color="#f97316" />
                <Text style={featuredStyles.badgeText}>FEATURED</Text>
              </View>
              <View style={featuredStyles.centralBadge}>
                <Text style={featuredStyles.centralText}>Central Govt</Text>
              </View>
            </View>
            <Text style={featuredStyles.title}>PM Ujjwala Yojana 2.0</Text>
            <Text style={featuredStyles.desc}>
              Free LPG connections to BPL households and women below poverty
              line. Covers deposit, first refill and stove at no cost.
            </Text>
            <View style={featuredStyles.benefitsRow}>
              <View style={featuredStyles.benefitChip}>
                <Text style={featuredStyles.benefitVal}>₹1,600</Text>
                <Text style={featuredStyles.benefitLabel}>One-time Aid</Text>
              </View>
              <View style={featuredStyles.benefitChip}>
                <Text style={featuredStyles.benefitVal}>8.3Cr+</Text>
                <Text style={featuredStyles.benefitLabel}>Beneficiaries</Text>
              </View>
              <View style={featuredStyles.benefitChip}>
                <Text style={featuredStyles.benefitVal}>97%</Text>
                <Text style={featuredStyles.benefitLabel}>Your Match</Text>
              </View>
            </View>
            <View style={featuredStyles.cta}>
              <Text style={featuredStyles.ctaText}>View & Apply Now</Text>
              <ArrowRight size={16} color="#0b1a16" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── How It Works ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <SectionHeader title="How It Works" />
          <View style={stepStyles.container}>
            {HOW_IT_WORKS.map((step, i) => (
              <StepCard
                key={step.step}
                {...step}
                isLast={i === HOW_IT_WORKS.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ── Trust Badges ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <View style={trustStyles.row}>
            <View style={trustStyles.badge}>
              <Shield size={14} color="#22c55e" />
              <Text style={trustStyles.text}>Govt. Verified</Text>
            </View>
            <View style={trustStyles.badge}>
              <Star size={14} color="#f59e0b" />
              <Text style={trustStyles.text}>4.9 Rating</Text>
            </View>
            <View style={trustStyles.badge}>
              <Zap size={14} color="#a78bfa" />
              <Text style={trustStyles.text}>Instant Match</Text>
            </View>
          </View>
        </View>

        {/* ── Testimonials ── */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader title="Success Stories" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
          >
            {TESTIMONIALS.map((t) => (
              <View key={t.id} style={{ width: 300 }}>
                <TestimonialCard item={t} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Bottom CTA Banner ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <View style={bottomBannerStyles.card}>
            <Text style={bottomBannerStyles.emoji}>🇮🇳</Text>
            <Text style={bottomBannerStyles.title}>
              Ready to claim your benefits?
            </Text>
            <Text style={bottomBannerStyles.subtitle}>
              It's free, secure, and takes under 3 minutes.
            </Text>
            <TouchableOpacity
              style={bottomBannerStyles.btn}
              activeOpacity={0.85}
            >
              <Text style={bottomBannerStyles.btnText}>Get Started Free</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </View>
  );
}

function SectionHeader({ title, linkText }) {
  return (
    <View style={sectionHeaderStyles.row}>
      <Text style={sectionHeaderStyles.title}>{title}</Text>
      {linkText && (
        <TouchableOpacity style={sectionHeaderStyles.link} activeOpacity={0.7}>
          <Text style={sectionHeaderStyles.linkText}>{linkText}</Text>
          <ChevronRight size={14} color="#f97316" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────

const headerStyles = {
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    width: 38,
    height: 38,
    backgroundColor: "#f97316",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  appName: { color: "#f8fafc", fontSize: 18, fontWeight: "800" },
  tagline: { color: "#64748b", fontSize: 11, marginTop: 1 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f97316",
    borderWidth: 1.5,
    borderColor: "#0b1a16",
  },
};

const heroStyles = {
  wrap: { paddingHorizontal: 16, marginTop: 20 },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(249,115,22,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)",
    marginBottom: 14,
  },
  aiChipText: { color: "#f97316", fontSize: 12, fontWeight: "600" },
  title: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  cta: {
    backgroundColor: "#f97316",
    width: "100%",
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondary: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
};

const statsStyles = {
  row: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 16,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 4,
  },
};

const statStyles = {
  card: { flex: 1, alignItems: "center" },
  value: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  label: { color: "#64748b", fontSize: 11, marginTop: 3, fontWeight: "500" },
};

const nudgeStyles = {
  card: {
    backgroundColor: "rgba(249,115,22,0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.2)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  left: { flexDirection: "row", alignItems: "flex-start", flex: 1, gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(249,115,22,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#f8fafc", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  subtitle: { color: "#94a3b8", fontSize: 12, lineHeight: 17, marginBottom: 8 },
  barBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#f97316",
    borderRadius: 2,
  },
  progress: { color: "#f97316", fontSize: 11, fontWeight: "600" },
};

const catStyles = {
  pill: {
    alignItems: "center",
    gap: 6,
    minWidth: 72,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  label: { color: "#94a3b8", fontSize: 11, fontWeight: "600" },
};

const featuredStyles = {
  card: {
    backgroundColor: "rgba(249,115,22,0.07)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.25)",
    padding: 18,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(249,115,22,0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)",
  },
  badgeText: { color: "#f97316", fontSize: 10, fontWeight: "700" },
  centralBadge: {
    backgroundColor: "rgba(3,105,161,0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  centralText: { color: "#38bdf8", fontSize: 10, fontWeight: "700" },
  title: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  desc: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  benefitChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 10,
    alignItems: "center",
  },
  benefitVal: { color: "#f8fafc", fontSize: 15, fontWeight: "800" },
  benefitLabel: { color: "#64748b", fontSize: 10, marginTop: 2 },
  cta: {
    backgroundColor: "#f97316",
    borderRadius: 10,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: { color: "#0b1a16", fontSize: 14, fontWeight: "800" },
};

const stepStyles = {
  container: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 18,
  },
  row: { flexDirection: "row", gap: 14 },
  leftCol: { alignItems: "center", width: 40 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(249,115,22,0.12)",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  connector: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(249,115,22,0.2)",
    marginVertical: 6,
    minHeight: 20,
  },
  content: { flex: 1, paddingTop: 8 },
  stepNum: {
    color: "#f97316",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 4,
  },
  desc: { color: "#64748b", fontSize: 13, lineHeight: 19 },
};

const trustStyles = {
  row: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  text: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
};

const testimonialStyles = {
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  name: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  location: { color: "#64748b", fontSize: 11, marginTop: 1 },
  stars: { flexDirection: "row", gap: 2 },
  text: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 12,
  },
  schemeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(34,197,94,0.08)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
  },
  schemeLabel: { color: "#22c55e", fontSize: 11, fontWeight: "600" },
};

const bottomBannerStyles = {
  card: {
    backgroundColor: "rgba(249,115,22,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.2)",
    padding: 24,
    alignItems: "center",
  },
  emoji: { fontSize: 36, marginBottom: 10 },
  title: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#f97316",
    width: "100%",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
};

const sectionHeaderStyles = {
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  link: { flexDirection: "row", alignItems: "center", gap: 2 },
  linkText: { color: "#f97316", fontSize: 13, fontWeight: "600" },
};
