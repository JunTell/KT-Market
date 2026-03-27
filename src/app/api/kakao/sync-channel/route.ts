import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { profile_id } = await request.json();

    if (!profile_id) {
      return NextResponse.json(
        { error: "profile_id is required in request body" },
        { status: 400 }
      );
    }

    // 1. Get the user's kakao_id from profiles using the Admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("kakao_id, provider")
      .eq("id", profile_id)
      .single();

    if (profileError || !profile) {
      console.error("[Kakao API] Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "User profile not found in database", details: profileError },
        { status: 404 }
      );
    }

    const kakaoId = profile.kakao_id;

    if (!kakaoId) {
      return NextResponse.json(
        { error: "User has no connected Kakao account (kakao_id is null)" },
        { status: 400 }
      );
    }

    // 2. Call Kakao API with Admin Key
    const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY;
    if (!kakaoAdminKey) {
      return NextResponse.json(
        { error: "Server configuration error: missing KAKAO_ADMIN_KEY" },
        { status: 500 }
      );
    }

    const kakaoUrl = `https://kapi.kakao.com/v1/api/talk/channels?target_id_type=user_id&target_id=${kakaoId}`;
    
    // As per Kakao guidelines, we must use x-www-form-urlencoded for the request and pass KakaoAK
    const kakaoRes = await fetch(kakaoUrl, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${kakaoAdminKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const kakaoData = await kakaoRes.json();

    if (!kakaoRes.ok) {
      console.error("[Kakao API] Fetch failed:", kakaoData);
      return NextResponse.json(
        { error: "Failed to fetch from Kakao API", details: kakaoData },
        { status: kakaoRes.status }
      );
    }

    // Example successful kakaoData: 
    // { "user_id": 123456, "channels": [ { "channel_uuid": "@ktmarket", "relation": "ADDED", "updated_at": "2023-..." } ] }
    
    // Default fallback to @ktmarket if variable isn't set, but better to enforce env
    const targetChannelId = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID || "@ktmarket";
    
    let status = "NONE";
    let addedAt = null;

    if (kakaoData.channels && Array.isArray(kakaoData.channels)) {
      const targetChannel = kakaoData.channels.find(
        (c: any) => c.channel_uuid === targetChannelId
      );

      if (targetChannel) {
        status = targetChannel.relation; // "ADDED", "BLOCKED", or "NONE"
        if (status === "ADDED" && targetChannel.updated_at) {
          addedAt = new Date(targetChannel.updated_at).toISOString();
        }
      }
    }

    // 3. Upsert into kakao_channel_status table using Admin client to bypass RLS
    const { error: upsertError } = await supabaseAdmin
      .from("kakao_channel_status")
      .upsert(
        {
          profile_id,
          kakao_id: kakaoId.toString(),
          status,
          channel_added_at: addedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" } // Upserts matching the unique profile_id
      );

    if (upsertError) {
      console.error("[Kakao API] Supabase upsert failed:", upsertError);
      return NextResponse.json(
        { error: "Failed to save status to database", details: upsertError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile_id,
      kakao_id: kakaoId,
      status, 
      channel_added_at: addedAt,
    });

  } catch (err: any) {
    console.error("[Kakao API] Internal error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
